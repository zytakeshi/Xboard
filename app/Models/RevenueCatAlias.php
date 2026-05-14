<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\RevenueCatAlias
 *
 * Maps a RevenueCat app_user_id (either an anonymous `$RCAnonymousID:...`
 * value or a numeric xboard user id rendered as a string) to the resolved
 * xboard user. Lives outside of `v2_user.revenuecat_app_user_id` so that
 * anonymous identifiers never poison the canonical user column.
 *
 * @property int $id
 * @property string $app_user_id RevenueCat app_user_id (anon or xboard id-as-string)
 * @property int $user_id Resolved v2_user.id
 * @property string $source Where the alias was learned (transfer|attribute|reconciler|recover_endpoint|login)
 * @property int|null $created_at
 * @property int|null $updated_at
 */
class RevenueCatAlias extends Model
{
    protected $table = 'v2_revenuecat_aliases';

    public $timestamps = false;

    protected $fillable = [
        'app_user_id',
        'user_id',
        'source',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'created_at' => 'integer',
        'updated_at' => 'integer',
    ];
}
