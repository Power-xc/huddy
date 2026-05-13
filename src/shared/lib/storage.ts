import {
  LocalStorageAdapter,
  type StorageAdapter,
} from "@entities/adapters";

export const storage: StorageAdapter = new LocalStorageAdapter();
