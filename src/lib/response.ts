export function successResponse<T>(data: T, message = 'Success') {
  return {
    status: true,
    message,
    data,
    errors: [],
  };
}

export function errorResponse(message: string, errors: string[] = []) {
  return {
    status: false,
    message,
    data: null,
    errors,
  };
}
