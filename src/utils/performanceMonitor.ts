// Utilitário para monitoramento de performance e detecção de vazamentos

interface PerformanceMetrics {
  memoryUsage: number;
  timestamp: number;
  activeTimers: number;
  activeRequests: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // Manter apenas os últimos 100 registros
  private activeTimers = new Set<NodeJS.Timeout>();
  private activeRequests = new Set<AbortController>();

  // Registrar um timer para monitoramento
  registerTimer(timer: NodeJS.Timeout): NodeJS.Timeout {
    this.activeTimers.add(timer);
    return timer;
  }

  // Limpar um timer registrado
  clearTimer(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.activeTimers.delete(timer);
  }

  // Registrar uma requisição para monitoramento
  registerRequest(): AbortController {
    const controller = new AbortController();
    this.activeRequests.add(controller);
    
    // Auto-remover quando a requisição for abortada
    controller.signal.addEventListener('abort', () => {
      this.activeRequests.delete(controller);
    });
    
    return controller;
  }

  // Coletar métricas atuais
  collectMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      memoryUsage: this.getMemoryUsage(),
      timestamp: Date.now(),
      activeTimers: this.activeTimers.size,
      activeRequests: this.activeRequests.size
    };

    this.metrics.push(metrics);
    
    // Manter apenas os últimos registros
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    return metrics;
  }

  // Obter uso de memória (aproximado)
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  // Detectar possíveis vazamentos
  detectLeaks(): { hasLeaks: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let hasLeaks = false;

    // Verificar timers ativos
    if (this.activeTimers.size > 10) {
      warnings.push(`Muitos timers ativos: ${this.activeTimers.size}`);
      hasLeaks = true;
    }

    // Verificar requisições ativas
    if (this.activeRequests.size > 5) {
      warnings.push(`Muitas requisições ativas: ${this.activeRequests.size}`);
      hasLeaks = true;
    }

    // Verificar crescimento de memória
    if (this.metrics.length >= 10) {
      const recent = this.metrics.slice(-10);
      const memoryGrowth = recent[recent.length - 1].memoryUsage - recent[0].memoryUsage;
      
      if (memoryGrowth > 10 * 1024 * 1024) { // 10MB
        warnings.push(`Crescimento de memória detectado: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);
        hasLeaks = true;
      }
    }

    return { hasLeaks, warnings };
  }

  // Limpar todos os recursos
  cleanup(): void {
    // Limpar todos os timers ativos
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();

    // Abortar todas as requisições ativas
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();

    // Limpar métricas
    this.metrics = [];
  }

  // Obter relatório de performance
  getReport(): {
    currentMetrics: PerformanceMetrics;
    leakDetection: { hasLeaks: boolean; warnings: string[] };
    history: PerformanceMetrics[];
  } {
    return {
      currentMetrics: this.collectMetrics(),
      leakDetection: this.detectLeaks(),
      history: [...this.metrics]
    };
  }
}

// Instância global do monitor
export const performanceMonitor = new PerformanceMonitor();

// Hook para usar o monitor em componentes React
export const usePerformanceMonitor = () => {
  const createTimer = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timer = setTimeout(callback, delay);
    return performanceMonitor.registerTimer(timer);
  };

  const clearTimer = (timer: NodeJS.Timeout): void => {
    performanceMonitor.clearTimer(timer);
  };

  const createRequest = (): AbortController => {
    return performanceMonitor.registerRequest();
  };

  const getReport = () => {
    return performanceMonitor.getReport();
  };

  return {
    createTimer,
    clearTimer,
    createRequest,
    getReport
  };
};

// Monitoramento automático (opcional)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Coletar métricas a cada 30 segundos em desenvolvimento
  const monitoringInterval = setInterval(() => {
    const report = performanceMonitor.getReport();
    
    if (report.leakDetection.hasLeaks) {
      console.warn('🚨 Possíveis vazamentos detectados:', report.leakDetection.warnings);
      console.log('📊 Métricas atuais:', report.currentMetrics);
    }
  }, 30000);

  // Limpar ao descarregar a página
  window.addEventListener('beforeunload', () => {
    clearInterval(monitoringInterval);
    performanceMonitor.cleanup();
  });
}