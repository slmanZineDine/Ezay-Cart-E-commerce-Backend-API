import { CloudinaryService } from './cloudinary.service';

export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER';

export const StorageProviderBinding = {
  provide: STORAGE_PROVIDER_TOKEN,
  useExisting: CloudinaryService,
};
