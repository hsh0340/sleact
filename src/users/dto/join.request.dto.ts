import { ApiProperty } from '@nestjs/swagger';

export class JoinRequestDto {
  @ApiProperty({
    example: 'hsh0340@naver.com',
    description: '이메일',
    required: true,
  })
  public email: string;

  @ApiProperty({
    example: 'aloilor',
    description: '닉네임',
    required: true,
  })
  public nickname: string;

  @ApiProperty({
    example: '12341234',
    description: '비밀번호',
    required: true,
  })
  public password: string;
}
