import { Injectable, OnModuleInit } from '@nestjs/common';
//import * as admin from 'firebase-admin';

import admin from '../../../config/firebase';

@Injectable()
export class FirebaseService {
  async sendToMany(
    tokens: string[],
    title: string,
    body: string,
    image?: string,
  ) {
    // console.log('====================');
    // console.log('TITLE:', title);
    // console.log('BODY:', body);
    // console.log('IMAGE:', image);
    // console.log('TOKENS:', tokens.length);
    // console.log('====================');
    return admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },

      android: {
        notification: image
          ? {
              imageUrl: image,
            }
          : {},
      },

      apns: image
        ? {
            fcmOptions: {
              imageUrl: image,
            },
          }
        : undefined,

      data: {
        image: image || '',
      },
    });
  }
}
