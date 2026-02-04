<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('v2_order', function (Blueprint $table) {
            $table->string('revenuecat_event_id', 255)->nullable()->unique()->after('callback_no');
            $table->string('revenuecat_transaction_id', 255)->nullable()->after('revenuecat_event_id');
            $table->string('revenuecat_original_transaction_id', 255)->nullable()->after('revenuecat_transaction_id');
            $table->string('revenuecat_product_id', 255)->nullable()->after('revenuecat_original_transaction_id');
            $table->string('currency', 3)->nullable()->after('total_amount');
        });

        Schema::create('v2_revenuecat_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id', 255)->unique();
            $table->string('event_type', 50)->index();
            $table->string('app_user_id', 255)->index();
            $table->string('transaction_id', 255)->nullable();
            $table->string('product_id', 255)->nullable();
            $table->string('environment', 20)->default('PRODUCTION');
            $table->json('payload');
            $table->boolean('processed')->default(false)->index();
            $table->timestamp('processed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::table('v2_user', function (Blueprint $table) {
            $table->string('revenuecat_app_user_id', 255)->nullable()->index()->after('uuid');
            $table->boolean('subscription_will_renew')->default(true)->after('expired_at');
            $table->boolean('subscription_billing_issue')->default(false)->after('subscription_will_renew');
            $table->unsignedInteger('subscription_grace_period_expires_at')->nullable()->after('subscription_billing_issue');
        });
    }

    public function down(): void
    {
        Schema::table('v2_order', function (Blueprint $table) {
            $table->dropColumn([
                'revenuecat_event_id',
                'revenuecat_transaction_id',
                'revenuecat_original_transaction_id',
                'revenuecat_product_id',
                'currency',
            ]);
        });

        Schema::dropIfExists('v2_revenuecat_events');

        Schema::table('v2_user', function (Blueprint $table) {
            $table->dropColumn([
                'revenuecat_app_user_id',
                'subscription_will_renew',
                'subscription_billing_issue',
                'subscription_grace_period_expires_at',
            ]);
        });
    }
};
