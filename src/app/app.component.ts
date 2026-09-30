import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';

const CELEBRATION_TIME = Date.parse('2026-11-14T12:00:00-06:00');

export function countdownAt(now: number) {
  const total = Math.max(0, Math.floor((CELEBRATION_TIME - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
    finished: now >= CELEBRATION_TIME
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('music') music?: ElementRef<HTMLAudioElement>;
  // Al agregar la canción en public/audio, configura aquí su ruta /audio/archivo.mp3.
  readonly musicSource: string | null = '/audio/xv.mp3';
  readonly musicPlaying = signal(false);
  readonly musicError = signal(false);

  async playMusic(): Promise<void> {
    const audio = this.music?.nativeElement;
    if (!audio || !this.musicSource) return;
    this.musicError.set(false);
    try {
      await audio.play();
    } catch {
      this.musicPlaying.set(false);
      this.musicError.set(true);
    }
  }

  toggleMusic(): void {
    const audio = this.music?.nativeElement;
    if (!audio || !this.musicSource) return;
    if (!audio.paused) audio.pause();
    else void this.playMusic();
  }

  @ViewChild('details') details?: ElementRef<HTMLElement>;
  // Número internacional sin espacios ni signo +. Pendiente de confirmar.
  readonly attendancePhone = '';
  readonly attendanceMessage = '¡Hola! Quiero confirmar mi asistencia a los XV años de Yanet Guadalupe el 14 de noviembre de 2026. Mi nombre es: ';
  get attendanceUrl(): string | null {
    return this.attendancePhone ? `https://wa.me/${this.attendancePhone}?text=${encodeURIComponent(this.attendanceMessage)}` : null;
  }
  readonly opened = signal(false);
  readonly opening = signal(false);
  readonly sparkles = Array.from({ length: 64 }, (_, i) => {
    const angle = (i * 137.5) * Math.PI / 180;
    const distance = 7 + (i % 7) * 1.65;
    return {
      x: `${Math.cos(angle) * distance}em`,
      y: `${Math.sin(angle) * distance * .75 - 4}em`,
      size: `${i % 4 === 0 ? 18 + i % 8 : 3 + i % 4}px`,
      delay: `${150 + (i % 8) * 85}ms`,
      rotation: `${i % 2 ? 100 : -100}deg`,
      star: i % 4 === 0
    };
  });
  readonly countdown = signal(countdownAt(Date.now()));
  private countdownTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (this.countdown().finished) return;
    this.countdownTimer = setInterval(() => {
      const remaining = countdownAt(Date.now());
      this.countdown.set(remaining);
      if (remaining.finished) clearInterval(this.countdownTimer);
    }, 1000);
  }

  private timer?: ReturnType<typeof setTimeout>;

  openInvitation(): void {
    if (this.opening() || this.opened()) return;
    this.opening.set(true);
    void this.playMusic();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.timer = setTimeout(() => {
      this.opened.set(true);
      this.opening.set(false);
      this.timer = setTimeout(() => {
        this.details?.nativeElement.focus({ preventScroll: true });
        this.details?.nativeElement.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
      });
    }, reducedMotion ? 0 : 3600);
  }

  ngOnDestroy(): void { clearTimeout(this.timer); clearInterval(this.countdownTimer); if (this.musicSource) this.music?.nativeElement.pause(); }
}
