import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: { username: string }) {
    if (!body.username || body.username.length < 2 || body.username.length > 24) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username must be between 2 and 24 characters',
        },
      };
    }
    return this.authService.login(body.username);
  }
}