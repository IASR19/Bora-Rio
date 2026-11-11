export interface JwtPayload {
  sub: string;
  email: string;
  /** Presente quando um admin está acessando esta conta em modo suporte: id do admin real. */
  impersonatorId?: string;
}
