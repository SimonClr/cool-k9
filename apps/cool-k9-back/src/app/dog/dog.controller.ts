import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DogService } from './dog.service';
import { CreateDogDto } from './create-dog.dto';
import { UpdateDogDto } from './update-dog.dto';
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

  @Patch(':id')
  updateDog(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateDogDto,
  ) {
    return this.dogService.updateDog(req.user.userId, id, dto);
  }
}
