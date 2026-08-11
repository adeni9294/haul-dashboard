package com.haulcibogo.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.app.PendingIntent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import android.net.Uri;

public class BootReceiver extends BroadcastReceiver {
    private static final String ADZAN_CHANNEL_ID = "adzan_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // recreate notification channel with custom sound
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    NotificationManager nm = (NotificationManager) context.getSystemService(NotificationManager.class);
                    if (nm != null) {
                        Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/raw/adzan");
                        NotificationChannel channel = new NotificationChannel(ADZAN_CHANNEL_ID, "Adzan Notifications", NotificationManager.IMPORTANCE_HIGH);
                        channel.setDescription("Channel untuk notifikasi adzan harian dengan suara adzan.mp3");
                        channel.setSound(soundUri, new android.media.AudioAttributes.Builder()
                                .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                                .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build());
                        channel.enableLights(true);
                        channel.enableVibration(true);
                        nm.createNotificationChannel(channel);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // Notify user to open the app to ensure schedules are restored (full automatic reschedule requires app-level logic)
            try {
                Intent openApp = new Intent(context, com.haulcibogo.app.MainActivity.class);
                openApp.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                PendingIntent pi = PendingIntent.getActivity(context, 0, openApp, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

                NotificationCompat.Builder nb = new NotificationCompat.Builder(context, ADZAN_CHANNEL_ID)
                        .setSmallIcon(context.getApplicationInfo().icon)
                        .setContentTitle("Haul Dashboard")
                        .setContentText("Perangkat baru saja dinyalakan. Buka aplikasi untuk menyusun ulang jadwal adzan.")
                        .setContentIntent(pi)
                        .setAutoCancel(true)
                        .setPriority(NotificationCompat.PRIORITY_HIGH);

                NotificationManager nm2 = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm2 != null) nm2.notify(2000, nb.build());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
