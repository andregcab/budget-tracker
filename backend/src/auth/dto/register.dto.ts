import {
  IsEmail,
  IsString,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { IsPasswordMatching } from '../validators/password-match.validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export class RegisterDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

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
