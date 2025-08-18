import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    required: false,
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User date of birth',
    required: false,
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'User gender',
    required: false,
    example: 'male',
    enum: [
      'male',
      'female',
      'other',
      'prefer-not-to-say',
      'Male',
      'Female',
      'Other',
      'Prefer-not-to-say',
    ],
  })
  @IsOptional()
  @IsEnum([
    'male',
    'female',
    'other',
    'prefer-not-to-say',
    'Male',
    'Female',
    'Other',
    'Prefer-not-to-say',
  ])
  gender?: string;
}
