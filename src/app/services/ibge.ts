import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError } from 'rxjs';

interface MunicipioIbge {
  id: number;
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla: string;
        nome: string;
      };
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class IbgeService {
  private apiUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';
  private cacheCidades: string[] = [];

  constructor(private http: HttpClient) { }

  listarMunicipios(): Observable<string[]> {
    if (this.cacheCidades.length > 0) {
      return of(this.cacheCidades);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem('ibge_municipios_formatados');
      if (cached) {
        try {
          this.cacheCidades = JSON.parse(cached);
          if (this.cacheCidades.length > 0) {
            return of(this.cacheCidades);
          }
        } catch {
          localStorage.removeItem('ibge_municipios_formatados');
        }
      }
    }

    return this.http.get<MunicipioIbge[]>(this.apiUrl).pipe(
      map(municipios => {
        return (municipios || []).map(m => {
          const uf = m.microrregiao?.mesorregiao?.UF?.sigla || '';
          return uf ? `${m.nome} - ${uf}` : m.nome;
        });
      }),
      tap(lista => {
        this.cacheCidades = lista;
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.setItem('ibge_municipios_formatados', JSON.stringify(lista));
          } catch {
          }
        }
      }),
      catchError(err => {
        console.error('Erro ao consultar API do IBGE:', err);
        return of(this.obterCidadesPadrao());
      })
    );
  }

  private obterCidadesPadrao(): string[] {
    return [
      'Assis - SP', 'Maracaí - SP', 'Cândido Mota - SP', 'Tarumã - SP', 'Palmital - SP',
      'Paraguaçu Paulista - SP', 'Ourinhos - SP', 'Presidente Prudente - SP', 'Marília - SP',
      'Bauru - SP', 'São Paulo - SP', 'Santos - SP', 'Campinas - SP', 'Ribeirão Preto - SP',
      'Londrina - PR', 'Maringá - PR', 'Curitiba - PR', 'Paranaguá - PR', 'Cascavel - PR',
      'Campo Grande - MS', 'Dourados - MS', 'Três Lagoas - MS', 'Cuiabá - MT', 'Rondonópolis - MT',
      'Goiânia - GO', 'Rio Verde - GO', 'Uberlândia - MG', 'Belo Horizonte - MG'
    ];
  }
}
