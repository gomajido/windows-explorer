import { NotFoundException, BusinessRuleException, ValidationException } from "../../shared/exceptions";

/**
 * Folder not found exception
 */
export class FolderNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super("Folder", id);
  }
}

/**
 * Folder validation exception
 */
export class FolderValidationException extends ValidationException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { entity: "folder", ...details });
  }
}

/**
 * Invalid folder name exception
 */
export class InvalidFolderNameException extends FolderValidationException {
  constructor() {
    super("Folder name is required and cannot be empty");
  }
}

/**
 * Invalid folder ID exception
 */
export class InvalidFolderIdException extends FolderValidationException {
  constructor() {
    super("Invalid folder ID");
  }
}

/**
 * Parent must be a folder exception
 */
export class ParentNotFolderException extends BusinessRuleException {
  constructor(parentId: number) {
    super("PARENT_NOT_FOLDER", "Parent must be a folder, not a file", { parentId });
  }
}

/**
 * Folder not deleted exception (for restore)
 */
export class FolderNotDeletedException extends BusinessRuleException {
  constructor(id: number) {
    super("FOLDER_NOT_DELETED", "Cannot restore a folder that is not deleted", { id });
  }
}

/**
 * Folder creation failed exception
 */
export class FolderCreationFailedException extends BusinessRuleException {
  constructor(details?: Record<string, unknown>) {
    super("FOLDER_CREATION_FAILED", "Failed to create folder", details);
  }
}
