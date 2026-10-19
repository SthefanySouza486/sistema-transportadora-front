import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appMoeda]',
  standalone: true,
  host: {
    inputmode: 'numeric',
    autocomplete: 'off',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MoedaDirective), multi: true },
  ],
})
export class MoedaDirective implements ControlValueAccessor {
  private static readonly formatador = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  private onChange: (valor: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  aoDigitar(event: InputEvent): void {
    const input = this.el.nativeElement;
    const valor = event.inputType === 'insertFromPaste'
      ? this.interpretarTextoColado(input.value)
      : this.interpretarDigitos(input.value);

    this.exibir(valor);
    this.onChange(valor);
  }

  @HostListener('blur')
  aoSair(): void {
    this.onTouched();
  }

  writeValue(valor: any): void {
    const numero = valor === null || valor === undefined || valor === '' ? null : Number(valor);
    this.exibir(numero === null || isNaN(numero) ? null : numero);
  }

  registerOnChange(fn: (valor: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.el.nativeElement.disabled = desabilitado;
  }

  private interpretarDigitos(texto: string): number | null {
    const digitos = texto.replace(/\D/g, '');
    if (!digitos) return null;
    return Number(digitos) / 100;
  }

  private interpretarTextoColado(texto: string): number | null {
    let limpo = texto.replace(/[^\d.,]/g, '');
    if (!limpo) return null;

    if (limpo.includes(',')) {
      limpo = limpo.replace(/\./g, '').replace(',', '.');
    } else if (!/^\d+\.\d{1,2}$/.test(limpo)) {
      limpo = limpo.replace(/\./g, '');
    }

    const numero = Number(limpo);
    return isNaN(numero) ? null : Math.round(numero * 100) / 100;
  }

  private exibir(valor: number | null): void {
    const input = this.el.nativeElement;
    input.value = valor === null ? '' : MoedaDirective.formatador.format(valor);
    const fim = input.value.length;
    input.setSelectionRange?.(fim, fim);
  }
}
