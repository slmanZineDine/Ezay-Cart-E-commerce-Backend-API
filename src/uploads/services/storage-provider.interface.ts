// The standard contract that ANY future cloud provider must implement
export interface IStorageProvider {
  generateUploadSignature(folder: string): Promise<any>;
  generateBulkUploadSignatures(count: number, folder: string): Promise<any>;
  deleteFile(storageKey: string): Promise<boolean>;
}
