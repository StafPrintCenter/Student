<?php

namespace App\Http\Controllers\Api\Student\Trainings\Contents\Quizzes;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuizResource;
use App\Models\Enrollment;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class StartController extends Controller
{
  #[OA\Post(
    path: '/student/trainings/lessons/quizzes/{quizId}/start',
    summary: 'Démarrer une tentative (ou en récupérer une déjà en cours)',
    tags: ['APPRENANT - FORMATIONS QUESTIONS'],
    security: [['sanctum' => []]],
    parameters: [new OA\Parameter(name: 'quizId', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
    responses: [
      new OA\Response(response: 201, description: 'Tentative démarrée'),
      new OA\Response(response: 403, description: 'Non inscrit à cette formation, ou contenu verrouillé'),
      new OA\Response(response: 404, description: 'Quiz non trouvé ou non publié'),
      new OA\Response(response: 409, description: 'Nombre maximal de tentatives atteint'),
    ]
  )]
  public function __invoke(Request $request, string $quizId)
  {
    $quiz = Quiz::with('questions.choices')
      ->where('id', $quizId)
      ->where('status', 'published')
      ->first();

    if (! $quiz) {
      return response()->json(['message' => 'Quiz introuvable ou non publié.'], 404);
    }

    $student = $request->user();
    $trainingId = $quiz->lesson->module->training_id;

    $enrollment = Enrollment::where('training_id', $trainingId)
      ->where('student_id', $student->id)
      ->first();

    if (! $enrollment) {
      return response()->json(['message' => "Vous n'êtes pas inscrit à cette formation."], 403);
    }

    if (! $enrollment->hasContentAccess()) {
      return response()->json(['message' => "Contenu verrouillé - le paiement minimum requis pour accéder au contenu n'a pas encore été atteint."], 403);
    }

    $existingAttempt = QuizAttempt::where('quiz_id', $quiz->id)
      ->where('student_id', $student->id)
      ->where('status', 'in_progress')
      ->first();

    if ($existingAttempt) {
      if (! $existingAttempt->isExpired()) {
        // Reprise normale de la tentative en cours
        return response()->json([
          'data' => [
            'attemptId' => $existingAttempt->id,
            'startedAt' => $existingAttempt->started_at->toIso8601String(),
            'timeLimitSec' => $quiz->time_limit_sec,
            'quiz' => new QuizResource($quiz),
          ],
        ]);
      }

      // La tentative en cours a dépassé le temps imparti sans jamais être soumise on la clôture explicitement au lieu de la laisser "in_progress" pour toujours.
      $existingAttempt->update([
        'status' => 'expired',
        'submitted_at' => now(),
        'duration_sec' => $existingAttempt->elapsedSeconds(),
      ]);
    }

    $attemptsCount = QuizAttempt::where('quiz_id', $quiz->id)->where('student_id', $student->id)->count();

    if ($quiz->max_attempts !== null && $attemptsCount >= $quiz->max_attempts) {
      return response()->json(['message' => 'Nombre maximal de tentatives atteint pour ce quiz.'], 409);
    }

    $attempt = QuizAttempt::create([
      'quiz_id' => $quiz->id,
      'student_id' => $student->id,
      'enrollment_id' => $enrollment->id,
      'attempt_number' => $attemptsCount + 1,
      'started_at' => now(),
    ]);

    return response()->json([
      'data' => [
        'attemptId' => $attempt->id,
        'startedAt' => $attempt->started_at->toIso8601String(),
        'timeLimitSec' => $quiz->time_limit_sec,
        'isAutoSubmitted' => $quiz->auto_submit_on_timeout,
        'quiz' => new QuizResource($quiz),
      ],
    ], 201);
  }
}
