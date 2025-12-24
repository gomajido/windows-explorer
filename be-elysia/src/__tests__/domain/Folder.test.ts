import { describe, it, expect } from "bun:test";
import { ERROR_MESSAGES, FOLDER_ERROR_CODES } from "../../domain/folder/constants";

describe("Folder Domain", () => {
  describe("ERROR_MESSAGES", () => {
    it("should have required error messages", () => {
      expect(ERROR_MESSAGES.INVALID_NAME).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_ID).toBeDefined();
      expect(ERROR_MESSAGES.FOLDER_NOT_FOUND).toBeDefined();
    });

    it("should have descriptive error messages", () => {
      expect(typeof ERROR_MESSAGES.INVALID_NAME).toBe("string");
      expect(ERROR_MESSAGES.INVALID_NAME.length).toBeGreaterThan(0);
    });
  });

  describe("FOLDER_ERROR_CODES", () => {
    it("should have required error codes", () => {
      expect(FOLDER_ERROR_CODES.NOT_FOUND).toBeDefined();
      expect(FOLDER_ERROR_CODES.INVALID_ID).toBeDefined();
      expect(FOLDER_ERROR_CODES.INVALID_NAME).toBeDefined();
    });

    it("should have unique error codes", () => {
      const codes = Object.values(FOLDER_ERROR_CODES);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});
