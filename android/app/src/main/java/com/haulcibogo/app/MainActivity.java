package com.haulcibogo.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String ADZAN_CHANNEL_ID = "adzan_channel";
    private static final String ADZAN_CHANNEL_NAME = "Adzan Notifications";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Membuka kunci izin pemutaran audio adzan otomatis di WebView
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }

        // Buat Notification Channel dengan custom sound (adzan.mp3 di res/raw)
        createAdzanNotificationChannel();
    }

    private void createAdzanNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(NotificationManager.class);
                if (nm == null) return;

                // Uri ke resource raw/adzan.mp3. Pastikan file ada: android/app/src/main/res/raw/adzan.mp3
                Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/raw/adzan");

                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();

                NotificationChannel channel = new NotificationChannel(ADZAN_CHANNEL_ID, ADZAN_CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH);
                channel.setDescription("Channel untuk notifikasi adzan harian dengan suara adzan.mp3");
                channel.setSound(soundUri, audioAttributes);
                channel.enableLights(true);
                channel.enableVibration(true);

                // Jika sudah ada channel dengan id sama, ini akan menggantinya
                nm.createNotificationChannel(channel);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
