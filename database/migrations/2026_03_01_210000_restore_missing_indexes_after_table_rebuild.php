<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // v2_order
        $this->addIndexIfMissing('v2_order', 'idx_v2_order_created_at', ['created_at']);
        $this->addIndexIfMissing('v2_order', 'idx_v2_order_status', ['status']);
        $this->addIndexIfMissing('v2_order', 'idx_v2_order_total_amount', ['total_amount']);
        $this->addIndexIfMissing('v2_order', 'idx_v2_order_commission_status', ['commission_status']);
        $this->addIndexIfMissing('v2_order', 'idx_v2_order_invite_user_id', ['invite_user_id']);
        $this->addIndexIfMissing('v2_order', 'idx_v2_order_commission_balance', ['commission_balance']);
        $this->addIndexIfMissing('v2_order', 'idx_v2_order_updated_at', ['updated_at']);
        $this->addUniqueIfMissing('v2_order', 'uq_v2_order_revenuecat_event_id', ['revenuecat_event_id']);

        // v2_user
        $this->addIndexIfMissing('v2_user', 'idx_v2_user_t', ['t']);
        $this->addIndexIfMissing('v2_user', 'idx_v2_user_online_count', ['online_count']);
        $this->addIndexIfMissing('v2_user', 'idx_v2_user_created_at', ['created_at']);
        $this->addIndexIfMissing('v2_user', 'idx_v2_user_revenuecat_app_user_id', ['revenuecat_app_user_id']);

        // v2_stat_server
        $this->addIndexIfMissing('v2_stat_server', 'idx_v2_stat_server_u', ['u']);
        $this->addIndexIfMissing('v2_stat_server', 'idx_v2_stat_server_d', ['d']);

        // v2_stat_user
        $this->addIndexIfMissing('v2_stat_user', 'idx_v2_stat_user_u', ['u']);
        $this->addIndexIfMissing('v2_stat_user', 'idx_v2_stat_user_d', ['d']);

        // v2_commission_log
        $this->addIndexIfMissing('v2_commission_log', 'idx_v2_commission_log_created_at', ['created_at']);
        $this->addIndexIfMissing('v2_commission_log', 'idx_v2_commission_log_get_amount', ['get_amount']);

        // v2_ticket
        $this->addIndexIfMissing('v2_ticket', 'idx_v2_ticket_status', ['status']);
        $this->addIndexIfMissing('v2_ticket', 'idx_v2_ticket_created_at', ['created_at']);
    }

    /**
     * Reverse the migrations.
     *
     * Intentionally left as no-op to avoid dropping indexes that may have been
     * recreated with different names during prior operations.
     */
    public function down(): void
    {
        // no-op
    }

    private function addIndexIfMissing(string $table, string $indexName, array $columns): void
    {
        if ($this->hasIndex($table, $columns, false)) {
            return;
        }

        $columnsSql = implode('`,`', $columns);
        DB::statement("ALTER TABLE `{$table}` ADD INDEX `{$indexName}` (`{$columnsSql}`)");
    }

    private function addUniqueIfMissing(string $table, string $indexName, array $columns): void
    {
        if ($this->hasIndex($table, $columns, true)) {
            return;
        }

        $columnsSql = implode('`,`', $columns);
        DB::statement("ALTER TABLE `{$table}` ADD UNIQUE INDEX `{$indexName}` (`{$columnsSql}`)");
    }

    private function hasIndex(string $table, array $columns, bool $unique): bool
    {
        $schema = DB::getDatabaseName();
        $rows = DB::select(
            'SELECT INDEX_NAME, NON_UNIQUE, COLUMN_NAME, SEQ_IN_INDEX
             FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
             ORDER BY INDEX_NAME, SEQ_IN_INDEX',
            [$schema, $table]
        );

        $indexMap = [];
        foreach ($rows as $row) {
            $indexName = $row->INDEX_NAME;
            if ($indexName === 'PRIMARY') {
                continue;
            }

            if (!isset($indexMap[$indexName])) {
                $indexMap[$indexName] = [
                    'non_unique' => (int)$row->NON_UNIQUE,
                    'columns' => [],
                ];
            }

            $indexMap[$indexName]['columns'][] = $row->COLUMN_NAME;
        }

        foreach ($indexMap as $indexMeta) {
            if ($indexMeta['columns'] !== $columns) {
                continue;
            }

            $isUnique = ($indexMeta['non_unique'] === 0);
            if ($isUnique === $unique) {
                return true;
            }
        }

        return false;
    }
};
