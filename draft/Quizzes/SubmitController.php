<?php

namespace App\Http\Controllers\Api\Student\Trainings\Contents\Quizzes;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Support\QuizScorer;
use App\Models\LessonProgress;
use App\Support\LessonProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class SubmitController extends Controller
{
  #[OA\Post(
    path: '/student/trainings/lessons/quiz-attempts/{id}/submit',
    summary: 'Soumettre ses reponses (une seule fois, toutes ensemble)',
    description: "'answers' en JSON : {\"question_id\": [\"choice_id\", ...], ...}",
    tags: ['APPRENANT - FORMATIONS QUESTIONS'],
    security: [['sanctum' => []]],
    parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\MediaType(
        mediaType: 'multipart/form-data',
        schema: new OA\Schema(required: ['answers'], properties: [
          new OA\Property(property: 'answers', type: 'string', description: 'JSON'),
        ])
      )
    ),
    responses: [
      new OA\Response(response: 200, description: 'Soumis et note'),
      new OA\Response(response: 403, description: "Pas votre tentative"),
      new OA\Response(response: 409, description: 'Deja soumise'),
      new OA\Response(response: 410, description: 'Temps ecoule, soumission refusee (auto_submit_on_timeout=false)'),
      new OA\Response(response: 422, description: 'Erreur de validation'),
    ]
  )]
  public function __invoke(Request $request, string $id)
  {
    $attempt = QuizAttempt::with('quiz.questions')->findOrFail($id);
    $student = $request->user();

    if ($attempt->student_id !== $student->id) {
      return response()->json(['message' => "Ce n'est pas votre tentative."], 403);
    }

    if ($attempt->status?->value !== 'in_progress') {
      return response()->json(['message' => 'Cette tentative a deja ete soumise.'], 409);
    }

    $isExpired = $attempt->isExpired();

    if ($isExpired && ! $attempt->quiz->auto_submit_on_timeout) {
      $attempt->update(['status' => 'expired', 'submitted_at' => now(), 'duration_sec' => $attempt->elapsedSeconds()]);

      return response()->json(['message' => 'Le temps imparti est ecoule, cette tentative est refusee.'], 410);
    }

    $answersInput = $request->input('answers');
    if (is_string($answersInput)) {
      $decoded = json_decode($answersInput, true);
      $answersInput = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }

    $validator = Validator::make(['answers' => $answersInput], ['answers' => ['required', 'array']]);

    if ($validator->fails()) {
      return response()->json(['errors' => $validator->errors()], 422);
    }

    DB::transaction(function () use ($attempt, $answersInput, $isExpired) {
      QuizScorer::score($attempt, $attempt->quiz, $answersInput);

      $attempt->update([
        'status' => 'graded',
        'submitted_at' => now(),
        'duration_sec' => $attempt->elapsedSeconds(),
        'is_auto_submitted' => $isExpired,
      ]);

      $lesson = $attempt->quiz->lesson;
      $existingBest = LessonProgress::where('enrollment_id', $attempt->enrollment_id)
        ->where('lesson_id', $lesson->id)
        ->value('best_score');

      $bestScore = max($attempt->score, $existingBest ?? 0);
      $isCompleted = $bestScore >= $attempt->quiz->pass_score;

      LessonProgressService::upsert($attempt->enrollment, $lesson, [
        'best_score' => $bestScore,
        'status' => $isCompleted ? 'completed' : 'in_progress',
        'completed_at' => $isCompleted ? now() : null,
      ]);
    });

    $attempt->refresh()->load('answers.question.choices');

    return response()->json([
      'data' => [
        'attemptId' => $attempt->id,
        'score' => $attempt->score,
        'passed' => $attempt->score >= $attempt->quiz->pass_score,
        'isAutoSubmitted' => $attempt->is_auto_submitted,
        'answers' => $attempt->answers->map(fn($a) => [
          'questionId' => $a->question_id,
          'prompt' => $a->question->prompt,
          'selectedChoiceIds' => $a->selected_choice_ids,
          'correctChoiceIds' => $a->question->correctChoiceIds(),
          'isCorrect' => $a->is_correct,
          'pointsAwarded' => $a->points_awarded,
          'explanation' => $a->question->explanation,
        ]),
      ],
    ]);
  }
}
