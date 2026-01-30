import { AppError } from "../../src/shared/errors";

export async function expectRequiredFieldError(promise: Promise<any>) {
  await expect(promise).rejects.toThrow(AppError);
  await expect(promise).rejects.toMatchObject({
    code: AppError.REQUIRED,
  });
}
