<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create local plugin configuration table.
 *
 * While most settings use admin_setting(), this table provides
 * a dedicated store for plugin-specific data that may grow beyond
 * simple key-value pairs.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ai_support_config')) {
            Schema::create('ai_support_config', function (Blueprint $table) {
                $table->id();
                $table->string('key', 100)->unique();
                $table->text('value')->nullable();
                $table->timestamps();

                $table->index('key');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_support_config');
    }
};
