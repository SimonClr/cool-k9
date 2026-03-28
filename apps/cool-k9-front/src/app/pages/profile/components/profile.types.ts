export interface CardHandle {
  isDirty: boolean;
  canSave: boolean;
  save: () => Promise<void>;
}
