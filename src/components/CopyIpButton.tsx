import type { ReactNode } from 'react';
import { chakra } from '@chakra-ui/react';
import { SERVER_IP } from '../content';

export type CopyState = Record<string, boolean>;

export interface CopyHandlerArgs {
  buttonId: string;
  feedbackKey: 'hero' | 'join';
}

export type CopyHandler = (args: CopyHandlerArgs) => Promise<boolean>;
type CopyAppearance = 'rail' | 'inline' | 'primary';

interface CopyIpButtonProps {
  id: string;
  testId: string;
  feedbackKey: 'hero' | 'join';
  appearance?: CopyAppearance;
  title?: string;
  copied?: boolean;
  onCopy: CopyHandler;
  children: ReactNode;
}

export function CopyIpButton({
  id,
  testId,
  feedbackKey,
  appearance = 'inline',
  title,
  copied,
  onCopy,
  children,
}: CopyIpButtonProps) {
  const primary = appearance === 'primary';

  return (
    <chakra.button
      type="button"
      id={id}
      data-testid={testId}
      data-ip={SERVER_IP}
      data-copied={copied ? 'true' : 'false'}
      title={title}
      onClick={() => void onCopy({ buttonId: id, feedbackKey })}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      minH={10}
      px={primary ? 5 : 3}
      py={primary ? 2 : 1}
      border={primary ? '1px solid' : 'none'}
      borderRadius="md"
      bg={primary ? 'brand.600' : 'transparent'}
      color="inherit"
      cursor="pointer"
      _hover={{ bg: primary ? 'brand.500' : 'blackAlpha.100' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '2px' }}
    >
      {children}
    </chakra.button>
  );
}

interface CopyFeedbackProps {
  id: string;
  testId: string;
  visible: boolean;
  panel?: boolean;
  children: ReactNode;
}

export function CopyFeedback({ id, testId, visible, panel = false, children }: CopyFeedbackProps) {
  return (
    <chakra.p
      id={id}
      hidden={!visible}
      aria-live="polite"
      data-testid={testId}
      fontSize="sm"
      fontWeight="bold"
      mt={2}
    >
      {children}
    </chakra.p>
  );
}
