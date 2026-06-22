export function isAppRunning(): boolean {
    return (global as any).__appRunning === true;
  }
  
  export function markAppRunning(): void {
    (global as any).__appRunning = true;
  }