<?php

namespace App\Plugins\AiSupport\Observers;

use App\Models\TicketMessage;
use App\Plugins\AiSupport\AiSupportPlugin;
use App\Plugins\AiSupport\Jobs\PushTicketEventJob;

class TicketMessageObserver
{
    public function created(TicketMessage $message): void
    {
        if (TicketObserver::$suppressEvents || !AiSupportPlugin::isEnabled()) return;

        $ticket = $message->ticket;
        if (!$ticket) return;

        $isUserReply = ($message->user_id === $ticket->user_id);
        $eventType = $isUserReply ? 'user_replied' : 'admin_replied';

        PushTicketEventJob::dispatch(
            $eventType,
            (string) $ticket->id,
            (string) ($isUserReply ? $message->user_id : null),
            ['reply_id' => (string) $message->id]
        );
    }
}
