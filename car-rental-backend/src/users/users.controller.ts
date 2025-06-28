import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dtos';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserResponseDto, ErrorResponseDto } from './interfaces';
import { UserResponse } from './interfaces/user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Register a new user account with email and password',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: CreateUserResponseDto,
    example: {
      message: 'User created successfully',
      user: {
        id: '12345',
        email: 'john@example.com',
        firstName: 'John',
        role: 'user',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ErrorResponseDto,
    example: {
      statusCode: 400,
      message: ['email must be a valid email address'],
      error: 'Bad Request',
    },
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.userService.create(createUserDto);

    return {
      message: 'User created successfully',
      user,
    };
  }

  /**
   * Get all users (Admin only)
   * GET /users
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users. Admin access required.',
  })
  async findAll(): Promise<{
    message: string;
    users: UserResponse[];
    count: number;
  }> {
    const users = await this.userService.findAll();
    return {
      message: 'Users retrieved successfully',
      users,
      count: users.length,
    };
  }

  /**
   * Get user profile (own profile or admin can view any)
   * GET /users/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieve a specific user by their ID. Users can view their own profile, admins can view any profile.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
    example: '12345',
  })
  async findOne(@Param('id') id: string): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.userService.findOne(id);

    return {
      message: 'User retrieved successfully',
      user,
    };
  }

  /**
   * Update user information
   * PATCH /users/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user information',
    description:
      'Update user profile information. Users can update their own profile, admins can update any profile.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
    example: '12345',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.userService.update(id, updateUserDto);

    return {
      message: 'User updated successfully',
      user,
    };
  }

  /**
   * Delete user account
   * DELETE /users/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user account',
    description:
      'Delete a user account. Users can delete their own account, admins can delete any account.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
    example: '12345',
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.remove(id);
  }
}
