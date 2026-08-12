import { chakra, Flex, Text } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { navItems } from '../content';
import { CopyIpButton, type CopyHandler, type CopyState } from './CopyIpButton';
import { CopyIcon } from './CopyIcon';

interface SiteHeaderProps {
  activeSection: string;
  copiedButtons: CopyState;
  onCopy: CopyHandler;
}

const RouterLink = chakra(NavLink);

export function SiteHeader({ activeSection, copiedButtons, onCopy }: SiteHeaderProps) {
  const { pathname } = useLocation();
  const homeHref = pathname !== '/' ? '/#hero' : '#hero';

  return (
    <chakra.header
      className="site-header"
      data-testid="site-nav"
      position="sticky"
      top={0}
      zIndex={20}
      bg="white"
      borderBottom="1px solid"
      borderColor="blackAlpha.200"
    >
      <Flex
        className="topbar"
        maxW="1500px"
        mx="auto"
        minH={16}
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={4}
        px={{ base: 4, md: 8 }}
        py={3}
      >
        <chakra.a
          className="brand-mark"
          href={homeHref}
          aria-label="AzothMC home"
          display="inline-flex"
          alignItems="center"
          gap={3}
          flexShrink={0}
          _focusVisible={{ outline: '2px solid', outlineColor: 'teal.500', outlineOffset: '4px' }}
        >
          <chakra.span className="brand-mark-copy" display="grid" lineHeight={1.05}>
            <chakra.span className="brand-mark-word" fontSize="sm" fontWeight="bold" letterSpacing="0.16em">
              AZOTHMC
            </chakra.span>
            <chakra.span className="brand-mark-sub" color="blackAlpha.600" fontSize="2xs" letterSpacing="0.12em" mt={1}>
              FIELD GUIDE
            </chakra.span>
          </chakra.span>
        </chakra.a>

        <Flex
          as="nav"
          className="primary-nav"
          aria-label="Primary"
          gap={1}
          align="center"
          wrap="wrap"
          justify="center"
          flex={1}
          display={{ base: 'none', lg: 'flex' }}
        >
          {navItems.map((item) => {
            const active = activeSection === item.section;
            const face = (
              <chakra.span className="nav-tab-face" display="inline-flex" alignItems="center" gap={2}>
                <chakra.span className="nav-tab-index" color={active ? 'blackAlpha.700' : 'blackAlpha.500'} fontSize="2xs">
                  {item.index}
                </chakra.span>
                <chakra.span className="nav-tab-label">{item.label}</chakra.span>
              </chakra.span>
            );
            const className = `nav-tab${item.isJoin ? ' nav-tab-join' : ''}${active ? ' is-active' : ''}`;
            const linkProps = {
              display: 'inline-flex',
              alignItems: 'center',
              minH: 9,
              px: 3,
              borderRadius: 'md',
              color: active ? 'blackAlpha.900' : 'blackAlpha.700',
              bg: active ? 'blackAlpha.200' : 'transparent',
              fontSize: 'sm',
              fontWeight: active || item.isJoin ? 'bold' : 'medium',
              _hover: { bg: active ? 'blackAlpha.200' : 'blackAlpha.100' },
              _focusVisible: { outline: '2px solid', outlineColor: 'teal.500', outlineOffset: '2px' },
            } as const;

            return item.to ? (
              <RouterLink key={item.section} to={item.to} className={className} aria-label={item.ariaLabel} {...linkProps}>
                {face}
              </RouterLink>
            ) : (
              <chakra.a
                key={item.section}
                href={pathname !== '/' ? `/${item.href}` : item.href}
                className={className}
                data-section={item.section}
                aria-label={item.ariaLabel}
                {...linkProps}
              >
                {face}
              </chakra.a>
            );
          })}
        </Flex>

        <chakra.a
          className="discord-link"
          href="https://discord.gg/azothmc"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join the AzothMC Discord"
          display={{ base: 'none', md: 'inline-flex' }}
          alignItems="center"
          gap={2}
          color="blackAlpha.700"
          fontSize="sm"
          _hover={{ color: 'blackAlpha.900' }}
          _focusVisible={{ outline: '2px solid', outlineColor: 'teal.500', outlineOffset: '3px' }}
        >
          <chakra.span className="discord-dot" aria-hidden="true" boxSize={2} borderRadius="full" bg="teal.500" />
          <chakra.span>Discord</chakra.span>
        </chakra.a>
      </Flex>

      <Flex
        className="ip-rail"
        align="center"
        justify="center"
        gap={3}
        px={4}
        pb={3}
        wrap="wrap"
        borderTop="1px solid"
        borderColor="blackAlpha.200"
      >
        <CopyIpButton
          id="copy-ip-nav"
          testId="copy-ip-nav"
          feedbackKey="hero"
          appearance="rail"
          title="Copy server IP"
          copied={copiedButtons['copy-ip-nav']}
          onCopy={onCopy}
        >
          <chakra.span className="ip-status-dot" aria-hidden="true" boxSize={2} borderRadius="full" bg="green.400" />
          <chakra.span className="ip-hang-label" color="blackAlpha.700" letterSpacing="0.08em" fontSize="xs">CONNECT</chakra.span>
          <chakra.span className="ip-hang-text" data-testid="server-ip-nav" fontWeight="medium">play.azothmc.com</chakra.span>
          <CopyIcon />
        </CopyIpButton>
        <Text as="span" className="ip-rail-note" color="blackAlpha.600" fontSize="2xs">
          JAVA EDITION / NO MODS
        </Text>
      </Flex>
    </chakra.header>
  );
}
