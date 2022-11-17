import { AuthModule } from "@auth/auth.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import {
  AuthController,
  HealthController,
  PlaylistsController,
  QueuesController,
  UsersController,
  VideosController,
  YoutubeController,
} from "./controllers";

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [
    AuthController,
    HealthController,
    PlaylistsController,
    UsersController,
    VideosController,
    QueuesController,
    YoutubeController,
  ],
})
export class ApiModule {}
