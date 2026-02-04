<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RevenueCatEvent extends Model
{
    protected $table = 'v2_revenuecat_events';

    protected $fillable = [
        'event_id',
        'event_type',
        'app_user_id',
        'transaction_id',
        'product_id',
        'environment',
        'payload',
        'processed',
        'processed_at',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed' => 'boolean',
        'processed_at' => 'datetime',
    ];

    public function markProcessed(): void
    {
        $this->update([
            'processed' => true,
            'processed_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'processed' => false,
            'error_message' => $error,
        ]);
    }

    public static function isDuplicate(string $eventId): bool
    {
        return self::where('event_id', $eventId)->exists();
    }
}
