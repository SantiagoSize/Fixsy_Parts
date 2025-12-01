import React from 'react';

type CategoryCardProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  to?: string;
  onClick?: () => void;
};

// Tarjeta reutilizable con semántica accesible y preparada para enlace o acción.
export function CategoryCard({ title, subtitle, imageSrc, to, onClick }: CategoryCardProps) {
  const Wrapper = to ? 'a' : 'article';
  return (
    <Wrapper
      className="category-card"
      {...(to ? { href: to } : {})}
      {...(onClick ? { role: 'button', tabIndex: 0, onClick } : {})}
      aria-label={`Explorar categoría ${title}`}
    >
      <div className="category-media">
        <img src={imageSrc} alt={`Categoría ${title}`} loading="lazy" />
      </div>
      <div className="category-body">
        <h3 className="category-name">{title}</h3>
        <p className="category-desc">{subtitle}</p>
      </div>
    </Wrapper>
  );
}

export default CategoryCard;
