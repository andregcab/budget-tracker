import { IsString, Matches, MinLength, Validate } from 'class-validator';
import { IsPasswordMatching } from '../validators/password-match.validator';
import { PASSWORD_REGEX } from '../constants/password';

const USERNAME_REGEX = /^[a-zA-Z0-9._@+-]+$/;

export class RegisterDto {
  @IsString()
  @MinLength(1, { message: 'Username is required' })
  @Matches(USERNAME_REGEX, {
    message: 'Username can only contain letters, numbers, and . _ @ + -',
  })
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  @Validate(IsPasswordMatching)
  passwordConfirm: string;
}
