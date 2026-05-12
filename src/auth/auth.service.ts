import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.usersService.create(email, hashed);

    return this.buildAuthResponse(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user.id, user.email);
  }

  private async buildAuthResponse(userId: string, email: string) {
    const accessToken = await this.jwtService.signAsync({
      sub: userId,
      email,
    });

    return {
      accessToken,
      user: { id: userId, email },
    };
  }
}
