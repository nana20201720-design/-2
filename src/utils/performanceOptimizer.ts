/**
 * Performance Optimizer & Low-End Android Device Adaptation Layer
 * Ensures steady 60 FPS / 30 FPS animation & physics calculations on lower-end Android devices.
 */

export interface PerformanceConfig {
  isLowEndDevice: boolean;
  maxParticles: number;
  maxDecals: number;
  hudSyncIntervalMs: number;
  enableComplexShadows: boolean;
  targetFPS: number;
}

class PerformanceOptimizer {
  private config: PerformanceConfig;
  private fpsHistory: number[] = [];
  private lastFrameTime = performance.now();
  private lowEndDetected = false;

  constructor() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
    const lowCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
    const lowMemory = typeof navigator !== 'undefined' && (navigator as any).deviceMemory ? (navigator as any).deviceMemory <= 4 : false;

    this.lowEndDetected = isMobile && (lowCores || lowMemory);

    this.config = {
      isLowEndDevice: this.lowEndDetected,
      maxParticles: this.lowEndDetected ? 75 : 220,
      maxDecals: this.lowEndDetected ? 50 : 150,
      hudSyncIntervalMs: this.lowEndDetected ? 50 : 35, // Throttles React state updates to avoid GC pressure
      enableComplexShadows: !this.lowEndDetected,
      targetFPS: 60,
    };
  }

  public getConfig(): PerformanceConfig {
    return this.config;
  }

  public reportFrameTime(currentTime: number): void {
    const delta = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    if (delta > 0) {
      const fps = 1000 / delta;
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 30) {
        this.fpsHistory.shift();
      }
      // If average FPS drops below 40 on low-end, auto-scale down particle limits dynamically
      if (this.fpsHistory.length >= 20) {
        const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        if (avgFPS < 42 && !this.lowEndDetected) {
          this.lowEndDetected = true;
          this.config.isLowEndDevice = true;
          this.config.maxParticles = 60;
          this.config.maxDecals = 40;
          this.config.hudSyncIntervalMs = 60;
          this.config.enableComplexShadows = false;
        }
      }
    }
  }

  public clampDeltaTime(rawDt: number): number {
    // Prevent physics instability or huge jumps during frame drops or tab switching
    const maxDt = this.config.isLowEndDevice ? 0.045 : 0.033;
    return Math.min(maxDt, Math.max(0.005, rawDt));
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
