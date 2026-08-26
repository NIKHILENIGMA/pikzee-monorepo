import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface StandardResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  timestamp: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse()
    const statusCode = response.statusCode

    return next.handle().pipe(
      map((data) => ({
        success: statusCode >= 200 && statusCode < 300,
        statusCode,
        message: data?.message || 'Request processed successfully',
        data: data?.message ? (data.data !== undefined ? data.data : data) : data,
        timestamp: new Date().toISOString(),
      })),
    )
  }
}
