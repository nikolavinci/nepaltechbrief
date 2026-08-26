<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/social-login', [\App\Http\Controllers\Api\AuthController::class, 'socialLogin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
        Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/articles', [\App\Http\Controllers\Api\ArticleController::class, 'store']);
    Route::put('/articles/{id}', [\App\Http\Controllers\Api\ArticleController::class, 'update']);
    Route::delete('/articles/{id}', [\App\Http\Controllers\Api\ArticleController::class, 'destroy']);

    Route::post('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'store']);
    Route::put('/categories/{id}', [\App\Http\Controllers\Api\CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [\App\Http\Controllers\Api\CategoryController::class, 'destroy']);

    Route::get('/rss-feeds', [\App\Http\Controllers\Api\RssFeedController::class, 'index']);
    Route::post('/rss-feeds', [\App\Http\Controllers\Api\RssFeedController::class, 'store']);
    Route::put('/rss-feeds/{id}', [\App\Http\Controllers\Api\RssFeedController::class, 'update']);
    Route::delete('/rss-feeds/{id}', [\App\Http\Controllers\Api\RssFeedController::class, 'destroy']);

    Route::get('/media', [\App\Http\Controllers\Api\MediaController::class, 'index']);
    Route::post('/media/upload', [\App\Http\Controllers\Api\MediaController::class, 'upload']);
    
    // Users
    Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
    Route::get('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'show']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
    
    // Settings (Superadmin only)
    Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
    Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'store']);

    // Instead of a dedicated AnalyticsController for dashboard, just return stats inline for now
    Route::get('/analytics/dashboard', function () {
        return response()->json([
            'total_users' => \App\Models\User::count(),
            'total_articles' => \App\Models\Article::count(),
            'total_categories' => \App\Models\Category::count(),
            'total_rss_feeds' => \App\Models\RssFeed::count()
        ]);
    });
});

Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/articles', [\App\Http\Controllers\Api\ArticleController::class, 'index']);
Route::get('/articles/{slug}', [\App\Http\Controllers\Api\ArticleController::class, 'show']);
