export interface ShippingAddress {
  region: string;
  provincia?: string;
  comuna?: string;
}

export interface ShippingEstimate {
  price: number;
  label: string;
  carrier: string;
  eta: string;
}

export function estimateShipping(address: ShippingAddress, subtotal: number): ShippingEstimate {
  if (subtotal >= 100000) {
    return {
      price: 0,
      label: 'Envio GRATIS por compras sobre $100.000',
      carrier: 'Chilexpress (estimado)',
      eta: '2 a 5 dias habiles',
    };
  }

  const isMetro = address.region.toLowerCase().includes('metropolitana');
  if (isMetro) {
    return {
      price: 3990,
      label: `Envio estimado a ${address.region}`,
      carrier: 'Chilexpress (estimado)',
      eta: '2 a 3 dias habiles',
    };
  }

  return {
    price: 5990,
    label: `Envio estimado a ${address.region}`,
    carrier: 'Chilexpress (estimado)',
    eta: '3 a 5 dias habiles',
  };
}
