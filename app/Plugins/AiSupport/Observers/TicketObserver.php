<?php

namespace App\Plugins\AiSupport\Observers;

use App\Models\Ticket;
use App\Plugins\AiSupport\AiSupportPlugin;
use App\Plugins\AiSupport\Jobs\PushTicketEventJob;

class TicketObserver
{
    public static bool $suppressEvents = false;

    public function created(Ticket $ticket): void
    {
        if (self::$suppressEvents || !AiSupportPlugin::isEnabled()) return;
        PushTicketEventJob::dispatch('opened', (string) $ticket->id, (string) $ticket->user_id);
    }

    public function updated(Ticket $ticket): void
    {
        if (self::$suppressEvents || !AiSupportPlugin::isEnabled()) return;
        if ($ticket->isDirty('status') && $ticket->status === 1) {
            PushTicketEventJob::dispatch('closed', (string) $ticket->id, (string) $ticket->user_id);
        }
    }

    public function deleted(Ticket $ticket): void
    {
        if (self::$suppressEvents || !AiSupportPlugin::isEnabled()) return;
        PushTicketEventJob::dispatch('deleted', (string) $ticket->id, (string) $ticket->user_id);
    }
}
