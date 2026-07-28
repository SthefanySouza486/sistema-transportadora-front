export interface Viagem {
    id?: number; 
    motoristaId: number; 
    veiculoId: number; 
    dataViagem: String; 
    origem: string; 
    destino: string; 
    dinheiroEntregue?: number; 
    pesoTonelada: number; 
    valorTonelada: number; 
    valorFrete?: number; 
    valorComissao?: number;
    statusViagem?: string;
}
