import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { IUserRepositoryGateway } from '../gateway/user-repository-gateway-interface';
import { User } from '../entities/user.model';
import { Repository } from 'typeorm';
import { createUsers } from 'src/utils/create-entities';
import { validateUpdateFields } from 'src/utils/validate-update-fields';

export class UserRepositoryAdapterTypeorm implements IUserRepositoryGateway {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(props: CreateUserDto): Promise<UserEntity> {
    const newUser = this.userRepository.create(props);
    const user = new UserEntity({ ...props, id: newUser.id, companies: [] });

    return user;
  }

  async findAll(): Promise<Omit<UserEntity, 'password'>[]> {
    const allUsers = await this.userRepository.find();
    const users = createUsers(allUsers);

    return users;
  }

  async findOne(id: number): Promise<Omit<UserEntity, 'password'>> {
    const hasUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!hasUser) return;

    const [user] = createUsers([hasUser]);

    return user;
  }

  async remove(id: number): Promise<{ id: number }> {
    const hasUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!hasUser) return;

    const { id: userId } = await this.userRepository.remove(hasUser);

    return { id: userId };
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const hasUser = await this.userRepository.findOne({
      where: { email },
    });

    const [user] = createUsers([hasUser]);

    return { ...user, password: hasUser.password };
  }

  async update(
    id: number,
    data: UpdateUserDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    const hasUser = await this.userRepository.findOne({ where: { id } });
    if (!hasUser) return;

    const dataToChange = validateUpdateFields<UpdateUserDto>(data, {});
    await this.userRepository.update(id, dataToChange);
    const [user] = createUsers([{ ...hasUser, ...dataToChange }]);

    return user;
  }
}