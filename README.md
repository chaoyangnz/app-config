# App config service for Angular and NestJS

## Install

```
npm i @cloudaffine/app-config
```

## Angular

In your `AppModule`
```
import { ConfigModule } from '@cloudaffine/app-config/angular';
import { APP_INITIALIZER } from '@angular/core';

@NgModule({
    imports: [
        ConfigModule.forRoot({
            browser: {
                url: '/config.json'
            },
            server: {
                paths: ['./config.yaml']
            }
        })
    ],
    providers: [
        {
            provide: APP_INITIALIZER
            useFactory: ConfigModule.initializer,
            multi: true
        }
    ]
})
export class AppModule {}
```

Then in your service or component, optional you can specify a type as the config schema.

```
@Injectable()
export class SomeService {
    constructor(private configService: ConfigService<any>) {}

    func() {
        const aa = this.configService.config.aa;
    }
}
```

## NestJS

In your `AppModule`
```
imort { ConfigModule } from '@cloudaffine/app-config/nestjs';

@Module({
    imports: [
        ConfigModule.forRoot({
            paths: ['./config.yaml']
        })
    ]
})
export class AppModule {}
```

Then in your service or component, optional you can specify a type as the config schema.

```
@Injectable()
export class SomeService {
    constructor(private configService: ConfigService<any>) {}

    func() {
        const aa = this.configService.config.aa;
    }
}
```


