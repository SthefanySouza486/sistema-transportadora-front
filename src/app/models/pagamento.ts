export interface Pagamento {
  id?: number;
  motoristaId: number;
  nomeMotorista?: string;
  gestorId: number;
  dataPagamento: string;
  periodoReferencia: string;
  valorPago: number;
  statusPagamento: string;
  fotoComprovante?: string; 
}
