/**
 * Utilitário para disparar eventos customizados relacionados a propriedades
 * Usado para notificar componentes sobre mudanças em tempo real
 */

export interface PropertyEventDetail {
  propertyId?: string;
  userId?: string;
  limitInfo?: any;
  syncResult?: {
    oldCount: number;
    newCount: number;
    difference: number;
  };
}

export class PropertyEventDispatcher {
  /**
   * Dispara evento quando uma propriedade é criada
   */
  static propertyCreated(detail: PropertyEventDetail) {
    console.log('[EVENT] Disparando evento propertyCreated:', detail);
    window.dispatchEvent(new CustomEvent('propertyCreated', { detail }));
  }

  /**
   * Dispara evento quando uma propriedade é ativada/desativada
   */
  static propertyToggled(detail: PropertyEventDetail) {
    console.log('[EVENT] Disparando evento propertyToggled:', detail);
    window.dispatchEvent(new CustomEvent('propertyToggled', { detail }));
  }

  /**
   * Dispara evento quando uma propriedade é deletada
   */
  static propertyDeleted(detail: PropertyEventDetail) {
    console.log('[EVENT] Disparando evento propertyDeleted:', detail);
    window.dispatchEvent(new CustomEvent('propertyDeleted', { detail }));
  }

  /**
   * Dispara evento quando o contador de propriedades é sincronizado
   */
  static propertyCountSynced(detail: PropertyEventDetail) {
    console.log('[EVENT] Disparando evento propertyCountSynced:', detail);
    window.dispatchEvent(new CustomEvent('propertyCountSynced', { detail }));
  }

  /**
   * Processa resposta da API e dispara evento apropriado se eventType estiver presente
   */
  static processApiResponse(response: any, additionalDetail?: Partial<PropertyEventDetail>) {
    if (!response?.eventType) return;

    const detail: PropertyEventDetail = {
      propertyId: response.property?._id || response.property?.id,
      limitInfo: response.limitInfo,
      ...additionalDetail
    };

    switch (response.eventType) {
      case 'propertyCreated':
        this.propertyCreated(detail);
        break;
      case 'propertyToggled':
        this.propertyToggled(detail);
        break;
      case 'propertyDeleted':
        this.propertyDeleted(detail);
        break;
      default:
        console.warn('[EVENT] Tipo de evento desconhecido:', response.eventType);
    }
  }

  /**
   * Adiciona listener para múltiplos eventos de propriedade
   */
  static addPropertyEventListeners(
    callbacks: {
      onPropertyCreated?: (detail: PropertyEventDetail) => void;
      onPropertyToggled?: (detail: PropertyEventDetail) => void;
      onPropertyDeleted?: (detail: PropertyEventDetail) => void;
      onPropertyCountSynced?: (detail: PropertyEventDetail) => void;
    }
  ) {
    const listeners: Array<{ event: string; handler: (e: any) => void }> = [];

    if (callbacks.onPropertyCreated) {
      const handler = (e: any) => callbacks.onPropertyCreated!(e.detail);
      window.addEventListener('propertyCreated', handler);
      listeners.push({ event: 'propertyCreated', handler });
    }

    if (callbacks.onPropertyToggled) {
      const handler = (e: any) => callbacks.onPropertyToggled!(e.detail);
      window.addEventListener('propertyToggled', handler);
      listeners.push({ event: 'propertyToggled', handler });
    }

    if (callbacks.onPropertyDeleted) {
      const handler = (e: any) => callbacks.onPropertyDeleted!(e.detail);
      window.addEventListener('propertyDeleted', handler);
      listeners.push({ event: 'propertyDeleted', handler });
    }

    if (callbacks.onPropertyCountSynced) {
      const handler = (e: any) => callbacks.onPropertyCountSynced!(e.detail);
      window.addEventListener('propertyCountSynced', handler);
      listeners.push({ event: 'propertyCountSynced', handler });
    }

    // Retorna função de cleanup
    return () => {
      listeners.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
    };
  }
}

export default PropertyEventDispatcher;