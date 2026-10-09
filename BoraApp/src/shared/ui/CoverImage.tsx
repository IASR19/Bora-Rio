import { useState } from 'react';

import { cn } from '@/utils/cn';

/** Capas do catálogo apontam para sites de terceiros; se a origem mudar ou bloquear
 * hotlink, some com a imagem e deixa aparecer o fundo do container. */
export function CoverImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) return null;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
