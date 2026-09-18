import { settingsManager } from './settingsManager';

/**
 * Tactical Haptic Feedback Engine
 * Provides distinct tactile vibration pulses for military realism on mobile and touch devices.
 * Respects player's haptic toggle setting in settingsManager.
 */
class HapticsEngine {
  /**
   * Check if vibration is supported and enabled in settings
   */
  private isEnabled(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    if (!('vibrate' in navigator)) return false;
    try {
      const s = settingsManager.getSettings();
      return Boolean(s.haptics);
    } catch {
      return true;
    }
  }

  /**
   * Subtle tick (12ms) - for button clicks, tabs, menu toggles
   */
  public light() {
    if (!this.isEnabled()) return;
    try {
      navigator.vibrate(12);
    } catch {}
  }

  /**
   * Firm tactical pulse (35ms) - for weapon switches, joining rooms, spectating
   */
  public medium() {
    if (!this.isEnabled()) return;
    try {
      navigator.vibrate(35);
    } catch {}
  }

  /**
   * Heavy recoil pulse (60ms) - for spawning into combat, firing, explosions
   */
  public heavy() {
    if (!this.isEnabled()) return;
    try {
      navigator.vibrate(60);
    } catch {}
  }

  /**
   * Double combat recoil pulse ([30, 25, 45]) - for quick play launch, respawn
   */
  public combatPulse() {
    if (!this.isEnabled()) return;
    try {
      navigator.vibrate([30, 25, 45]);
    } catch {}
  }

  /**
   * Victory / Reward pulse ([20, 30, 20, 30, 50])
   */
  public victory() {
    if (!this.isEnabled()) return;
    try {
      navigator.vibrate([20, 30, 20, 30, 50]);
    } catch {}
  }
}

export const haptics = new HapticsEngine();
