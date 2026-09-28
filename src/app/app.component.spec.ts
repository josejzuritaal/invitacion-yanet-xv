import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent, countdownAt } from './app.component';

describe('Invitación de Yanet', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    spyOn(HTMLElement.prototype, 'scrollIntoView');
  });

  it('oculta los detalles hasta terminar la apertura y evita clics repetidos', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector<HTMLElement>('#invitation-details')!.hidden).toBeTrue();
    root.querySelector<HTMLButtonElement>('button.envelope')!.click();
    fixture.componentInstance.openInvitation();
    tick(3599);
    fixture.detectChanges();
    expect(root.querySelector<HTMLElement>('#invitation-details')!.hidden).toBeTrue();
    tick(1);
    fixture.detectChanges();
    expect(root.querySelector<HTMLElement>('#invitation-details')!.hidden).toBeFalse();
    expect(root.querySelector<HTMLButtonElement>('button.envelope')!.getAttribute('aria-expanded')).toBe('true');
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    fixture.destroy();
  }));

  it('muestra los detalles inmediatamente al preferir movimiento reducido', fakeAsync(() => {
    (window.matchMedia as jasmine.Spy).and.returnValue({ matches: true } as MediaQueryList);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    fixture.componentInstance.openInvitation();
    tick(0);
    fixture.detectChanges();
    expect(fixture.componentInstance.opened()).toBeTrue();
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
    fixture.destroy();
  }));
});

describe('Cuenta regresiva', () => {
  it('calcula los días y horas usando la fecha de la misa en Tabasco', () => {
    expect(countdownAt(Date.parse('2026-11-13T10:58:57-06:00'))).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 3, finished: false });
  });
  it('se detiene en cero al llegar o pasar la celebración', () => {
    for (const date of ['2026-11-14T18:00:00Z', '2026-11-15T18:00:00Z']) {
      expect(countdownAt(Date.parse(date))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
    }
  });
});
