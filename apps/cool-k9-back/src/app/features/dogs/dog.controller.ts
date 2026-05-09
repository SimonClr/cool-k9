import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DogService } from './dog.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { AuthenticatedRequest } from '../../common/types/authenticated-request';

@Controller('dogs')
@UseGuards(SupabaseAuthGuard)
export class DogController {
  constructor(private readonly dogService: DogService) {}

  @Get()
  getDogs(
    @Req() req: AuthenticatedRequest,
    @Query('userId') userId?: string,
  ) {
    const effectiveUserId = req.user.role === 'admin' && userId ? userId : req.user.userId;
    return this.dogService.getDogs(effectiveUserId);
  }

  @Post()
  createDog(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDogDto,
  ) {
    return this.dogService.createDog(req.user.userId, dto);
  }

  @Patch(':id')
  updateDog(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDogDto,
  ) {
    return this.dogService.updateDog(req.user.userId, id, dto);
  }
}
