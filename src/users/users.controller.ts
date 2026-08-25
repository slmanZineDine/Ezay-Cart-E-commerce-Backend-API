import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import {
  UserResponseDto,
  PaginatedUsersResponseDto,
} from './swagger/user.swagger.dto';
import { PasswordResetService } from 'src/auth/services/password-reset.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // GET /users
  @Get()
  @ApiOperation({
    summary: 'Get all users',
  })
  @ApiOkResponse({
    type: PaginatedUsersResponseDto,
    description: 'Returns a paginated list of users',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  // GET /users/me
  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated user',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Returns the authenticated user information',
  })
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findCurrentById(user.sub);
  }

  // PATCH /users/me
  @Patch('me')
  @ApiOperation({
    summary: 'Update current authenticated user',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Current authenticated user updated successfully',
  })
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: JwtPayload, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.sub, body);
  }

  // GET /users/:id
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Returns a user by the given id',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post(':id/force-password-reset')
  @ApiOperation({
    summary: 'Force password reset',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Sent reset password email successfully',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async forcePasswordReset(@Param('id', ParseIntPipe) id: number) {
    return this.passwordResetService.forcePasswordReset(id);
  }

  // POST /users
  @Post()
  @ApiOperation({
    summary: 'Create new user',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'User created successfully',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  // PATCH /users/:id
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User updated successfully',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  // DELETE /users/:id
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    this.usersService.delete(id);

    return {
      message: `User ${id} deleted successfully`,
    };
  }
}
