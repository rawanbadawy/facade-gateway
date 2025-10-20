import { Module } from '@nestjs/common';
import { AdapterRegistry } from './registry.service';
@Module({ providers: [AdapterRegistry], exports: [AdapterRegistry] })
export class AdapterModule {}
