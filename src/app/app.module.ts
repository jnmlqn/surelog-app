import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { 
    // url: 'http://localhost:3001', 
    url: 'https://surelog.ws.632apps.com',
    options: {}
};

@NgModule({
    declarations: [
        AppComponent,
    ],
    entryComponents: [
    
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
        }),
        AppRoutingModule,
        HttpClientModule,
        IonicStorageModule.forRoot(),
        SocketIoModule.forRoot(config)
    ],
    providers: [
        {
            provide: RouteReuseStrategy,
            useClass: IonicRouteStrategy 
        },
        HTTP,
        Geolocation,
        NativeGeocoder,
        AndroidPermissions,
        CameraPreview,
        File,
        SQLite,
        SQLitePorter,
        FileTransfer,
        FileOpener
    ],
    bootstrap: [
        AppComponent
    ],
})
export class AppModule {}
