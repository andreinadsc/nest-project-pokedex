import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/pokemon-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) { }

  async executeSeed() {
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon/?limit=650');
    const pokemonToInsert: { name: string, no: number }[] = [];

    await this.pokemonModel.deleteMany({});
    await this.pokemonModel.collection.dropIndexes();

    data.results.forEach(({ name, url }) => {
      const segment: string[] = url.split('/');
      const no: number = +segment.pop() | +segment.pop();
      pokemonToInsert.push({ name, no });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed Execute'
  }
}
