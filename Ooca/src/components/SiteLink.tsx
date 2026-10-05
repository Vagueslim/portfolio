import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { useNavigate, useInRouterContext } from 'react-router';
import { basePath } from '../content/localization';

function RoutedLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const navigate = useNavigate();
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target || props.download || !props.href) return;
    const url = new URL(props.href, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.startsWith(basePath) || /\.(?!html)[a-z0-9]+$/i.test(url.pathname)) return;
    event.preventDefault();
    navigate('/' + url.pathname.slice(basePath.length) + url.search + url.hash);
  };
  return <a {...props} onClick={click} />;
}
/** Preserve native links; intercept only same-origin document navigation. */
export function SiteLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return useInRouterContext() ? <RoutedLink {...props} /> : <a {...props} />;
}
