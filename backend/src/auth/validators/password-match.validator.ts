import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordMatching', async: false })
export class IsPasswordMatching implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const prop = (args.constraints?.[0] as string) || 'password';
    const obj = args.object as Record<string, unknown>;
    return value === obj[prop];
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}
