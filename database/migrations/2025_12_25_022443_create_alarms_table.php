<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
    //  */
    // "alarmId": "MJLAPNCC7PS_2DXZZ2K1P_BG5031825_1",
    //         "alarmName": "Camera 1",
    //         "alarmType": 10000,
    //         "alarmTime": 1766658257000,
    //         "channelNo": 1,
    //         "isEncrypt": 0,
    //         "isChecked": 0,
    //         "preTime": 5,
    //         "delayTime": 25,
    //         "deviceSerial": "BG5031825",
    //         "recState": 0,
    //         "alarmPicUrl": "https://isgp.ezvizlife.com/v3/alarms/pic/get?fileId=20251225022419-BG5031825-1-10000-2-1&deviceSerialNo=BG5031825&cn=1&isEncrypted=0&isCloudStored=0&ct=4&lc=7&bn=4_alialarm-sgp&isDevVideo=0",
    //         "relationAlarms": [],
    //         "customerType": null,
    //         "customerInfo": null



    public function up(): void
    {
        Schema::create('alarms', function (Blueprint $table) {
            $table->id();
            $table->string('alarmId');
            $table->string('alarm_name');
            $table->integer('alarm_type');
            $table->bigInteger('alarm_time');
            $table->integer('channel_no');
            $table->integer('is_encrypt')->default(0);
            $table->integer('is_checked')->default(0);
            $table->integer('pre_time');
            $table->integer('delay_time');
            $table->string('device_serial');
            $table->integer('rec_state')->default(0);
            $table->string('alarm_pic_url');
            $table->json('relation_alarms')->nullable();
            $table->string('customer_type')->nullable();
            $table->json('customer_info')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alarms');
    }
};
