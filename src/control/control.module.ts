import { Module } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { CircuitBreakerService } from './circuit-breaker.service';

@Module({
  providers: [RateLimitService, CircuitBreakerService],
  exports: [RateLimitService, CircuitBreakerService],
})
export class ControlModule {}
