<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('v2_revenuecat_aliases', function (Blueprint $table) {
            $table->increments('id');
            $table->string('app_user_id', 255);
            $table->unsignedInteger('user_id');
            $table->string('source', 32);
            $table->unsignedInteger('created_at')->nullable();
            $table->unsignedInteger('updated_at')->nullable();

            $table->unique('app_user_id', 'uq_app_user');
            $table->index('user_id', 'idx_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('v2_revenuecat_aliases');
    }
};
