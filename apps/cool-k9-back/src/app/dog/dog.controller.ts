import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DogService } from './dog.service';
import { CreateDogDto } from './create-dog.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('dogs')
@UseGuards(SupabaseAuthGuard)
export class DogController {
  constructor(private readonly dogService: DogService) {}

  @Get()
  getDogs(
    @Req() req: { user: { userId: string; role?: string } },
    @Query('userId') userId?: string,
  ) {
    const effectiveUserId = req.user.role === 'admin' && userId ? userId : req.user.userId;
    return this.dogService.getDogs(effectiveUserId);
  }

  @Post()
  createDog(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateDogDto,
  ) {
    return this.dogService.createDog(req.user.userId, dto);
  }
}
