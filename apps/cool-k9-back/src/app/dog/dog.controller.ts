import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DogService } from './dog.service';
import { CreateDogDto } from './create-dog.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('dogs')
@UseGuards(SupabaseAuthGuard)
export class DogController {
  constructor(private readonly dogService: DogService) {}

  @Get()
  getDogs(@Req() req: { user: { userId: string } }) {
    return this.dogService.getDogs(req.user.userId);
  }

  @Post()
  createDog(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateDogDto,
  ) {
    return this.dogService.createDog(req.user.userId, dto);
  }
}
