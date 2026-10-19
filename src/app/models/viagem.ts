export interface Viagem {
    id?: number; 
    motoristaId: number; 
    nomeMotorista?: string;
    veiculoId: number; 
    dataViagem: string; 
    origem: string; 
    destino: string; 
    dinheiroEntregue?: number; 
    pesoTonelada: number; 
    valorTonelada: number; 
    valorFrete?: number; 
    valorComissao?: number;
    statusViagem?: string;
}
