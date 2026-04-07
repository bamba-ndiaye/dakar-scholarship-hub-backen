import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateApplicationDocumentDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiProperty()
  @IsString()
  fileType!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  size!: number;

  @ApiProperty()
  @IsString()
  url!: string;
}

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  university!: string;

  @ApiProperty()
  @IsString()
  program!: string;

  @ApiProperty()
  @IsString()
  level!: string;

  @ApiProperty()
  @IsString()
  year!: string;

  @ApiProperty({ example: 500000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty()
  @IsString()
  motivation!: string;

  @ApiPropertyOptional({ type: [CreateApplicationDocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateApplicationDocumentDto)
  documents?: CreateApplicationDocumentDto[];
}
