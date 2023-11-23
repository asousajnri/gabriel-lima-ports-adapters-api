import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ILocationRepositoryGateway } from './gateway/location-repository-gateway-interface';

@Injectable()
export class LocationService {
  constructor(
    @Inject('LocationRepositoryAdapterInMemory')
    readonly locationRepository: ILocationRepositoryGateway,
  ) {}

  private async validateCep(cep: string) {
    const regexp = new RegExp(/^\d{5}-\d{3}$/g);
    return regexp.test(cep);
  }

  async create({ cep, ...rest }: CreateLocationDto) {
    const isValidCep = await this.validateCep(cep);

    if (!isValidCep) {
      throw new BadRequestException('Cep is not valid');
    }

    return this.locationRepository.create({ ...rest, cep });
  }

  findAll() {
    return this.locationRepository.findAll();
  }

  findOne(id: number) {
    return this.locationRepository.findOne(id);
  }

  async update(id: number, { cep, ...rest }: UpdateLocationDto) {
    const isValidCep = await this.validateCep(cep);

    if (!isValidCep) {
      throw new BadRequestException('Cep is not valid');
    }

    return this.locationRepository.update(id, { ...rest, cep });
  }

  remove(id: number) {
    return this.locationRepository.remove(id);
  }
}
