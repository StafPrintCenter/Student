<?php

namespace App\Http\Controllers\Api\Student\Trainings\Contents\Quizzes;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AttemptsController extends Controller
{
  #[OA\Get(
    path: '/student/trainings/lessons/quizzes/{quizId}/attempts',
    summary: 'Historique de ses tentatives pour ce quiz',
    tags: ['APPRENANT - FORMATIONS QUESTIONS'],
    security: [['sanctum' => []]],
    parameters: [new OA\Parameter(name: 'quizId', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
    responses: [new OA\Response(response: 200, description: 'Historique des tentatives')]
  )]
  public function __invoke(Request $request, string $quizId)
  {
    $attempts = QuizAttempt::where('quiz_id', $quizId)
      ->where('student_id', $request->user()->id)
      ->orderByDesc('attempt_number')
      ->get();

    return response()->json([
      'data' => $attempts->map(fn($a) => [
        'attemptId' => $a->id,
        'attemptNumber' => $a->attempt_number,
        'status' => $a->status?->value,
        'score' => $a->score,
        'isAutoSubmitted' => $a->is_auto_submitted,
        'startedAt' => $a->started_at?->toIso8601String(),
        'submittedAt' => $a->submitted_at?->toIso8601String(),
      ]),
      'bestScore' => $attempts->max('score'),
    ]);
  }
}
