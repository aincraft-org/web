import { useLocation } from 'react-router-dom';
import { chakra, Flex, SimpleGrid, Text } from '@chakra-ui/react';

export function SiteFooter() {
  const { pathname } = useLocation();
  const href = (hash: string) => (pathname !== '/' ? `/${hash}` : hash);

  return (
    <chakra.footer className="site-footer" data-testid="site-footer" borderTop="1px solid" borderColor="blackAlpha.200" py={8}>
      <SimpleGrid className="footer-inner" maxW="1200px" mx="auto" columns={{ base: 1, md: 3 }} gap={6} alignItems="center" px={{ base: 4, md: 8 }}>
        <Flex className="footer-brand-lockup" align="center" gap={3}>
          <chakra.span className="brand-mark-symbol" aria-hidden="true" display="grid" placeItems="center" boxSize={8} border="1px solid" borderColor="blackAlpha.300" fontSize="xs">AZ</chakra.span>
          <chakra.p className="footer-brand" fontSize="sm" fontWeight="bold" letterSpacing="0.12em">AZOTHMC / FIELD GUIDE</chakra.p>
        </Flex>
        <chakra.p className="footer-note" color="blackAlpha.600" fontSize="sm" textAlign={{ base: 'left', md: 'center' }}>
          Independent community project. Not affiliated with Mojang or Microsoft. Minecraft is a trademark of Mojang Synergies AB.
        </chakra.p>
        <chakra.nav className="footer-nav" aria-label="Footer" display="flex" justifyContent={{ base: 'start', md: 'end' }} flexWrap="wrap" gap={4} fontSize="sm">
          <chakra.a href={href('#hero')} _hover={{ color: 'blackAlpha.900' }}>Home</chakra.a>
          <chakra.a href={href('#world')} _hover={{ color: 'blackAlpha.900' }}>World</chakra.a>
          <chakra.a href={href('#loot')} _hover={{ color: 'blackAlpha.900' }}>Items</chakra.a>
          <chakra.a href={href('#quests')} _hover={{ color: 'blackAlpha.900' }}>Quests</chakra.a>
          <chakra.a href={href('#endgame')} _hover={{ color: 'blackAlpha.900' }}>Endgame</chakra.a>
          <chakra.a href={href('#join')} _hover={{ color: 'blackAlpha.900' }}>Play</chakra.a>
        </chakra.nav>
      </SimpleGrid>
    </chakra.footer>
  );
}
