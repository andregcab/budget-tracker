import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordMatching', async: false })
export class IsPasswordMatching implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const obj = args.object as { password?: string };
    return value === obj.password;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}
