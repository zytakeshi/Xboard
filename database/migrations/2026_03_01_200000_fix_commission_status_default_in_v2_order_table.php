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
        DB::table('v2_order')->whereNull('commission_status')->update([
            'commission_status' => 0
        ]);

        DB::statement("ALTER TABLE `v2_order` MODIFY `commission_status` INT(11) NOT NULL DEFAULT 0 COMMENT '0待确认1发放中2有效3无效'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE `v2_order` MODIFY `commission_status` INT(11) NULL DEFAULT NULL COMMENT '0待确认1发放中2有效3无效'");
    }
};
