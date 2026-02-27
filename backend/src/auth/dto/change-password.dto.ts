import { IsString, Matches, MinLength, Validate } from 'class-validator';
import { IsPasswordMatching } from '../validators/password-match.validator';
import { PASSWORD_REGEX } from '../constants/password';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;

  @IsString()
  @Validate(IsPasswordMatching, ['newPassword'])
  newPasswordConfirm: string;
}
