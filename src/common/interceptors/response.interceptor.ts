import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { mapFileUrls, hasFileField } from '../utility/file-url.util';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        if (data?.success !== undefined) return data;

        const baseUrl = this.configService.get('BASE_URL');
        const uploadPath = this.configService.get('UPLOAD_PATH');
        const uploadUrl = `${baseUrl}/${uploadPath}`;

        // 🔥 clean fields
        const cleanData = this.cleanFields(data);

        // 🔥 map image/file URLs
        const finalData = mapFileUrls(cleanData, baseUrl, uploadPath);

        // 🔥 check if any file field exists
        const hasFiles = hasFileField(cleanData);

        return {
          success: true,
          message: 'Request successful',
          baseUrl, // ✅ always
          ...(hasFiles && { uploadUrl }), // ✅ only if needed
          data: finalData || null,
        };
      }),
    );
  }

  private cleanFields(data: any) {
    if (Array.isArray(data)) {
      return data.map((item) => this.cleanFields(item));
    }

    if (data && typeof data === 'object') {
      const obj = { ...data };
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }

    return data;
  }
}
