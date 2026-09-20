export type WeatherType = 'clear' | 'sandstorm' | 'fog' | 'dusk';

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  rotation?: number;
  rotationSpeed?: number;
}

export interface WeatherInfo {
  id: WeatherType;
  nameAr: string;
  nameEn: string;
  icon: string;
  descriptionAr: string;
  skyColors: [string, string, string, string]; // Top, Mid, Horizon, Haze
  tintColor: string; // RGBA overlay color
  fogDensity: number; // 0 to 1
  windSpeed: number; // Horizontal wind force (px/s)
  windDirectionAngle: number; // Angle in radians
}

export const WEATHER_CONFIGS: Record<WeatherType, WeatherInfo> = {
  clear: {
    id: 'clear',
    nameAr: 'مشمس وسماء صافية',
    nameEn: 'Sunny & Clear',
    icon: '☀️',
    descriptionAr: 'طقس مستقر ورؤية مثالية عبر أرجاء Outpost',
    skyColors: ['#53a8f5', '#76c4ff', '#b0e3ff', '#e3f6ff'],
    tintColor: 'rgba(255, 255, 255, 0)',
    fogDensity: 0,
    windSpeed: 25,
    windDirectionAngle: 0,
  },
  sandstorm: {
    id: 'sandstorm',
    nameAr: 'عاصفة رملية غبارية',
    nameEn: 'Outpost Sandstorm',
    icon: '🏜️',
    descriptionAr: 'عاصفة رملية شديدة تحد من الرؤية البعيدة وتزيد من صعوبة التصويب',
    skyColors: ['#a3723b', '#c49353', '#e0b879', '#f3d6a3'],
    tintColor: 'rgba(217, 130, 43, 0.22)',
    fogDensity: 0.45,
    windSpeed: 220,
    windDirectionAngle: 0.15,
  },
  fog: {
    id: 'fog',
    nameAr: 'ضباب كثيف للأنفاق',
    nameEn: 'Volumetric Cavern Fog',
    icon: '🌫️',
    descriptionAr: 'ضباب كثيف يغلف الكهوف والوادي ويمنح ميزة المباغتة للقتال القريب',
    skyColors: ['#425666', '#637a8c', '#92a7b8', '#c2d2de'],
    tintColor: 'rgba(175, 200, 215, 0.28)',
    fogDensity: 0.65,
    windSpeed: -40,
    windDirectionAngle: Math.PI,
  },
  dusk: {
    id: 'dusk',
    nameAr: 'شفق غروب الشمس',
    nameEn: 'Golden Dusk',
    icon: '🌅',
    descriptionAr: 'غروب أرجواني ذهبي يرسم ظلالاً طويلة فوق المعسكرات والجسر العالي',
    skyColors: ['#32184a', '#8a2b6e', '#d35400', '#f39c12'],
    tintColor: 'rgba(230, 100, 40, 0.18)',
    fogDensity: 0.15,
    windSpeed: 50,
    windDirectionAngle: -0.1,
  },
};

export class WeatherSystem {
  public currentWeather: WeatherType = 'clear';
  public targetWeather: WeatherType = 'clear';
  public transitionProgress: number = 1.0; // 0 to 1
  public autoCycle: boolean = true;
  
  private weatherTimer: number = 0;
  private readonly CYCLE_DURATION: number = 30; // Seconds per weather phase
  private particles: WeatherParticle[] = [];
  private maxParticles: number = 80;

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createRandomParticle(true));
    }
  }

  private createRandomParticle(initialSpawn = false): WeatherParticle {
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 720;
    const cfg = WEATHER_CONFIGS[this.currentWeather];

    const x = initialSpawn ? Math.random() * screenW * 2 - screenW * 0.5 : (cfg.windSpeed >= 0 ? -50 : screenW + 50);
    const y = Math.random() * screenH;

    let color = '#ffffff';
    let size = 2 + Math.random() * 3;
    let vx = cfg.windSpeed + (Math.random() - 0.5) * 40;
    let vy = (Math.random() - 0.5) * 20;
    let maxLife = 4 + Math.random() * 6;

    if (this.currentWeather === 'sandstorm') {
      color = Math.random() > 0.4 ? '#eab308' : '#d97706';
      size = 2.5 + Math.random() * 4.5;
      vx = cfg.windSpeed + Math.random() * 80;
      vy = 20 + Math.random() * 40;
    } else if (this.currentWeather === 'fog') {
      color = '#e2e8f0';
      size = 18 + Math.random() * 35;
      vx = cfg.windSpeed + (Math.random() - 0.5) * 15;
      vy = (Math.random() - 0.5) * 10;
      maxLife = 8 + Math.random() * 8;
    } else if (this.currentWeather === 'dusk') {
      color = Math.random() > 0.5 ? '#f97316' : '#facc15';
      size = 2 + Math.random() * 3.5;
      vx = cfg.windSpeed + Math.random() * 30;
      vy = -15 - Math.random() * 25; // Floating embers rise slightly
    } else {
      // Clear
      color = '#e0f2fe';
      size = 1.5 + Math.random() * 2;
      vx = cfg.windSpeed + (Math.random() - 0.5) * 20;
      vy = -10 + Math.random() * 20;
    }

    return {
      x,
      y,
      vx,
      vy,
      size,
      alpha: 0.1 + Math.random() * 0.5,
      life: initialSpawn ? Math.random() * maxLife : 0,
      maxLife,
      color,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 2,
    };
  }

  public setWeather(type: WeatherType) {
    if (type === this.currentWeather) return;
    this.targetWeather = type;
    this.transitionProgress = 0;
  }

  public toggleAutoCycle() {
    this.autoCycle = !this.autoCycle;
  }

  public update(dt: number) {
    // 1. Auto cycle countdown
    if (this.autoCycle) {
      this.weatherTimer += dt;
      if (this.weatherTimer >= this.CYCLE_DURATION) {
        this.weatherTimer = 0;
        const types: WeatherType[] = ['clear', 'sandstorm', 'fog', 'dusk'];
        const currentIndex = types.indexOf(this.targetWeather);
        const nextType = types[(currentIndex + 1) % types.length];
        this.setWeather(nextType);
      }
    }

    // 2. Smooth weather transition
    if (this.transitionProgress < 1.0) {
      this.transitionProgress += dt * 0.5; // 2-second transition
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.currentWeather = this.targetWeather;
      }
    }

    // 3. Update weather particles
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 720;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.rotation !== undefined && p.rotationSpeed) {
        p.rotation += p.rotationSpeed * dt;
      }

      // Respawn out of bounds or dead particles
      if (p.life >= p.maxLife || p.x > screenW + 100 || p.x < -100 || p.y > screenH + 100 || p.y < -100) {
        this.particles[i] = this.createRandomParticle(false);
      }
    }
  }

  /**
   * Helper to interpolate hex color channels
   */
  private interpolateColor(color1: string, color2: string, factor: number): string {
    const parse = (c: string) => {
      let hex = c.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
      const num = parseInt(hex, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };

    try {
      const c1 = parse(color1);
      const c2 = parse(color2);
      const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
      const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
      const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
      return `rgb(${r}, ${g}, ${b})`;
    } catch (e) {
      return color1;
    }
  }

  /**
   * Renders dynamic weather sky gradient
   */
  public getSkyGradients(ctx: CanvasRenderingContext2D, height: number): CanvasGradient {
    const currentCfg = WEATHER_CONFIGS[this.currentWeather];
    const targetCfg = WEATHER_CONFIGS[this.targetWeather];
    const p = this.transitionProgress;

    const top = this.interpolateColor(currentCfg.skyColors[0], targetCfg.skyColors[0], p);
    const mid = this.interpolateColor(currentCfg.skyColors[1], targetCfg.skyColors[1], p);
    const hor = this.interpolateColor(currentCfg.skyColors[2], targetCfg.skyColors[2], p);
    const haze = this.interpolateColor(currentCfg.skyColors[3], targetCfg.skyColors[3], p);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, top);
    grad.addColorStop(0.4, mid);
    grad.addColorStop(0.75, hor);
    grad.addColorStop(1, haze);
    return grad;
  }

  /**
   * Renders weather atmospheric overlay (dust streaks, fog billows, sunset glow, particles)
   */
  public renderOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    const currentCfg = WEATHER_CONFIGS[this.currentWeather];
    const targetCfg = WEATHER_CONFIGS[this.targetWeather];
    const p = this.transitionProgress;

    // 1. Environmental Color Tint
    if (this.currentWeather === 'sandstorm' || this.targetWeather === 'sandstorm') {
      const alpha = (1 - p) * currentCfg.fogDensity + p * targetCfg.fogDensity;
      ctx.fillStyle = `rgba(217, 130, 43, ${alpha * 0.35})`;
      ctx.fillRect(0, 0, width, height);
    } else if (this.currentWeather === 'fog' || this.targetWeather === 'fog') {
      const alpha = (1 - p) * currentCfg.fogDensity + p * targetCfg.fogDensity;
      ctx.fillStyle = `rgba(180, 205, 220, ${alpha * 0.35})`;
      ctx.fillRect(0, 0, width, height);
    } else if (this.currentWeather === 'dusk' || this.targetWeather === 'dusk') {
      ctx.fillStyle = 'rgba(230, 100, 40, 0.12)';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Weather Particles (Sand, Embers, Fog clouds, Dust)
    for (const part of this.particles) {
      ctx.save();
      ctx.globalAlpha = part.alpha * (Math.sin((part.life / part.maxLife) * Math.PI));

      if (this.currentWeather === 'fog') {
        // Volumetric Fog Cloud puff
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.currentWeather === 'sandstorm') {
        // Drifting horizontal sand particle streak
        ctx.strokeStyle = part.color;
        ctx.lineWidth = part.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(part.x, part.y);
        ctx.lineTo(part.x + 18, part.y + 4);
        ctx.stroke();
      } else if (this.currentWeather === 'dusk') {
        // Glowing Golden Ember Spark
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 6;
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sunny Clear Breeze Mote
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Renders the Tactical Weather Control & Status Badge on HUD
   * Minimized to prevent screen clutter per user request.
   */
  public renderHUD(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Hidden to ensure clean, professional game HUD
    return;
  }
}

export const weatherSystem = new WeatherSystem();
