export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

export type CameraErrorReason =
  | "permission-denied"
  | "not-found"
  | "not-supported"
  | "unknown";

export type CameraState = {
  status: CameraStatus;
  errorReason: CameraErrorReason | null;
  errorMessage: string | null;
  isMirrored: boolean;
};
