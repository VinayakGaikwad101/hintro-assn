export const successResponse = (traceId: string, data: any) => ({
  traceId,
  success: true,
  data,
});

export const errorResponse = (
  traceId: string,
  code: string,
  message: string,
) => ({
  traceId,
  success: false,
  error: { code, message },
});
