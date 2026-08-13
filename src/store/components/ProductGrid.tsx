import { Box, chakra, Flex, Heading, Image, List, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { packageUrl } from '../config';
import type { StoreCategory, StorePackage } from '../catalog';

interface ProductGridProps {
  packages: StorePackage[];
  categories: StoreCategory[];
}

export function ProductGrid({ packages, categories }: ProductGridProps) {
  if (!packages.length) {
    return (
      <VStack
        data-testid="store-empty"
        gap={3}
        justify="center"
        minH="320px"
        border="1px dashed"
        borderColor="blackAlpha.300"
        rounded="lg"
        p={10}
        textAlign="center"
      >
        <Text fontSize="4xl">🗝️</Text>
        <Heading as="p" size="md">No perks match.</Heading>
        <Text color="blackAlpha.600" fontSize="sm">Try a different search or category.</Text>
      </VStack>
    );
  }

  const categoryLabels = new Map(categories.map(({ id, label }) => [id, label]));

  return (
    <SimpleGrid
      as="ul"
      data-testid="store-grid"
      aria-label="Store packages"
      listStyle="none"
      m={0}
      p={0}
      columns={{ base: 1, md: 2, xl: 3 }}
      gap={5}
    >
      {packages.map((storePackage) => {
        const isTransparentArtwork = storePackage.image.endsWith('.png');

        return (
          <Box
            as="li"
            data-category={storePackage.category}
            data-testid="product-card"
            key={storePackage.slug}
            display="flex"
            flexDirection="column"
            minW={0}
            overflow="hidden"
            border="1px solid"
            borderColor={storePackage.featured ? 'teal.400' : 'blackAlpha.300'}
            rounded="lg"
          >
            <Box
              position="relative"
              h={{ base: '190px', md: '210px' }}
              overflow="hidden"
              bg="blackAlpha.100"
            >
              <Image
                data-testid="product-image"
                src={storePackage.image}
                alt={storePackage.imageAlt}
                w="100%"
                h="100%"
                objectFit={isTransparentArtwork ? 'contain' : 'cover'}
                p={isTransparentArtwork ? 5 : 0}
              />
              <Flex
                position="absolute"
                top={4}
                left={4}
                right={4}
                justify="space-between"
                align="start"
                gap={2}
              >
                <Box
                  as="span"
                  display="inline-flex"
                  px={2}
                  py={1}
                  rounded="sm"
                  bg="blackAlpha.700"
                  color="white"
                  fontSize="2xs"
                  textTransform="uppercase"
                >
                  {categoryLabels.get(storePackage.category)}
                </Box>
                {storePackage.featured ? (
                  <Box
                    as="span"
                    display="inline-flex"
                    px={2}
                    py={1}
                    rounded="sm"
                    bg="teal.500"
                    color="white"
                    fontSize="2xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    ★ Featured
                  </Box>
                ) : null}
              </Flex>
            </Box>

            <Box display="flex" flexDirection="column" flex={1} p={5}>
              <Heading as="h2" size="md" lineHeight="shorter">
                {storePackage.name}
              </Heading>
              <Text color="blackAlpha.700" fontSize="sm" mt={2}>
                {storePackage.description}
              </Text>
              <List.Root
                as="ul"
                gap={1.5}
                fontSize="sm"
                listStyleType="none"
                m={0}
                p={0}
                mt={4}
              >
                {storePackage.perks.map((perk) => (
                  <List.Item key={perk} display="flex" alignItems="center" gap={2}>
                    <Box aria-hidden="true" color="teal.500" fontSize="xs">▸</Box>
                    {perk}
                  </List.Item>
                ))}
              </List.Root>

              <Flex mt="auto" pt={5} align="end" justify="space-between" gap={3}>
                <Box>
                  <Text color="blackAlpha.600" fontSize="xs" textTransform="uppercase" letterSpacing="0.1em">
                    Price
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" lineHeight="shorter">
                    ${storePackage.price.toFixed(2)}
                  </Text>
                </Box>
                <chakra.a
                  data-slug={storePackage.slug}
                  data-testid="product-buy"
                  href={packageUrl(storePackage.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  minH={11}
                  px={5}
                  rounded="md"
                  bg="teal.600"
                  color="white"
                  fontWeight="bold"
                  fontSize="sm"
                  flexShrink={0}
                  _hover={{ bg: 'teal.500' }}
                  _focusVisible={{ outline: '2px solid', outlineColor: 'teal.500', outlineOffset: '2px' }}
                >
                  Buy now
                </chakra.a>
              </Flex>
            </Box>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
