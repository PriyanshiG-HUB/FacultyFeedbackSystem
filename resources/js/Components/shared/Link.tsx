import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({ href, children, className = '', onClick, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    }
    // Update hash to navigate page in dev harness
    const cleanHref = href.startsWith('#') ? href : `#${href}`;
    window.location.hash = cleanHref;
  };

  return (
    <a href={href.startsWith('#') ? href : `#${href}`} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export default Link;
