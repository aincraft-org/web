import { createIcon } from '@chakra-ui/react';

interface CopyIconProps {
  size?: number;
}

const CopyGlyph = createIcon({
  displayName: 'CopyGlyph',
  viewBox: '0 0 16 16',
  d: 'M5 5h9v9H5zM3 11V3.5A1.5 1.5 0 0 1 4.5 2H11',
  defaultProps: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
});

export function CopyIcon({ size = 13 }: CopyIconProps) {
  return <CopyGlyph className="icon-copy" boxSize={`${size}px`} aria-hidden="true" focusable="false" />;
}
