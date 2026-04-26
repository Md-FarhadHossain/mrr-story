import { getUploadAuthParams } from '@imagekit/next/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const authParams = getUploadAuthParams({
    privateKey: process.env.IMAGE_KIT_PRIVET_KEY!,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY!,
  });

  return NextResponse.json({
    ...authParams,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_END_POINT!,
  });
}
