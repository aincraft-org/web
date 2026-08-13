import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { TrendChart, formatEmeralds, type TrendPoint } from './TrendChart';

/* ------------------------------------------------------------------ */
/* API contract                                                        */
/* ------------------------------------------------------------------ */

export interface ItemSummary {
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: 'emeralds';
  change_24h: number;
  volume_24h: number;
  market_activity: string;
  image: string;
}

interface ItemsResponse {
  items: ItemSummary[];
}

interface TrendResponse {
  slug: string;
  range: string;
  points: TrendPoint[];
}

const API_VERSION = '/api/v1';

function marketBaseUrl(): string {
  const override = import.meta.env.VITE_MARKET_API_URL;
  if (!override) return API_VERSION;
  // Treat the override as an origin that may optionally carry a versioned API
  // path (e.g. "https://market.example.com" or ".../api/v1"). Strip any
  // trailing "/api/vN" suffix and trailing slashes, then re-append the v1
  // path so every request reaches /api/v1 consistently.
  const origin = override.replace(/\/+$/, '').replace(/\/api\/v\d+\/?$/i, '');
  return `${origin}${API_VERSION}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${marketBaseUrl()}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Market request failed: ${response.status}`);
  return (await response.json()) as T;
}

function fetchItems(): Promise<ItemsResponse> {
  return fetchJson<ItemsResponse>('/items');
}

function fetchTrend(slug: string, range = '24h'): Promise<TrendResponse> {
  return fetchJson<TrendResponse>(`/items/${encodeURIComponent(slug)}/trends?range=${encodeURIComponent(range)}`);
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

type FeedStatus = 'loading' | 'success' | 'error';

export function MarketplacePanel() {
  const [items, setItems] = useState<ItemSummary[] | null>(null);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>('loading');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [trend, setTrend] = useState<TrendPoint[] | null>(null);
  const [trendStatus, setTrendStatus] = useState<FeedStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    setFeedStatus('loading');
    fetchItems()
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setFeedStatus('success');
        if (response.items.length > 0 && selectedSlug === null) {
          setSelectedSlug(response.items[0].slug);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setFeedStatus('error');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedItem = useMemo(
    () => items?.find((item) => item.slug === selectedSlug) ?? null,
    [items, selectedSlug],
  );

  useEffect(() => {
    if (!selectedItem) return;
    let cancelled = false;
    setTrendStatus('loading');
    setTrend(null);
    fetchTrend(selectedItem.slug)
      .then((response) => {
        if (cancelled) return;
        setTrend(response.points);
        setTrendStatus('success');
      })
      .catch(() => {
        if (cancelled) return;
        setTrendStatus('error');
      });
    return () => { cancelled = true; };
  }, [selectedItem]);

  const selectItem = (slug: string) => {
    setSelectedSlug(slug);
  };

  return (
    <Box
      as="section"
      data-testid="marketplace-panel"
      aria-labelledby="marketplace-title"
      border="1px solid"
      borderColor="accent.400/30"
      bg="ink.800"
      rounded="lg"
      mt={{ base: 8, md: 12 }}
      p={{ base: 6, md: 8 }}
    >
      <Flex justify="space-between" align="end" wrap="wrap" gap={3} mb={6}>
        <Box>
          <Text color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.13em" textTransform="uppercase">
            FIELD NOTE / TRADE MARKET
          </Text>
          <Heading as="h2" id="marketplace-title" size="lg" color="paper.bright" mt={1}>
            Trade Market
          </Heading>
        </Box>
        <Text color="muted" fontSize="sm" maxW="42ch" data-testid="market-feed-status">
          {feedStatus === 'loading' ? (
            <Text as="span" fontWeight="bold">Loading market feed…</Text>
          ) : null}
          {feedStatus === 'error' ? (
            <Text as="span" fontWeight="bold">Market feed unavailable</Text>
          ) : null}
          {feedStatus === 'success' ? (
            <>
              <Text as="span" color="mint.400" fontWeight="bold" data-testid="market-live-status">
                Seeded economy snapshot
              </Text>{' '}
              — emerald prices served from a static seeded snapshot while the live in-game trade market is not connected.
            </>
          ) : null}
        </Text>
      </Flex>

      {feedStatus === 'loading' ? (
        <Box data-testid="market-loading" color="muted" fontSize="sm" py={10} textAlign="center">
          Loading the market ledger…
        </Box>
      ) : null}

      {feedStatus === 'error' ? (
        <Box
          data-testid="market-unavailable"
          border="1px dashed"
          borderColor="line"
          rounded="lg"
          p={10}
          textAlign="center"
        >
          <Text color="paper.bright" fontWeight="bold">
            Market feed is currently unavailable.
          </Text>
          <Text color="muted" fontSize="sm" mt={1}>
            Economy trends will return when the service is back online.
          </Text>
        </Box>
      ) : null}

      {feedStatus === 'success' && items && items.length === 0 ? (
        <Box data-testid="market-empty" color="muted" fontSize="sm" py={10} textAlign="center">
          No market listings are available right now.
        </Box>
      ) : null}

      {feedStatus === 'success' && items && items.length > 0 ? (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 6, lg: 8 }}>
          <Box as="ul" listStyleType="none" m={0} p={0} display="flex" flexDirection="column" gap={3}>
            {items.map((item) => {
              const selected = item.slug === selectedSlug;
              return (
                <Box as="li" key={item.slug} m={0}>
                  <Button
                    as="button"
                    type="button"
                    onClick={() => selectItem(item.slug)}
                    data-testid="market-item"
                    data-slug={item.slug}
                    data-selected={selected ? 'true' : undefined}
                    aria-pressed={selected}
                    w="100%"
                    display="flex"
                    flexDirection="column"
                    alignItems="stretch"
                    gap={2}
                    h="auto"
                    minH="auto"
                    p={4}
                    rounded="md"
                    border="1px solid"
                    borderColor={selected ? 'accent.400' : 'line'}
                    bg={selected ? 'rgba(7, 19, 22, 0.7)' : 'ink.900'}
                    color="paper.deep"
                    fontWeight="normal"
                    fontFamily="body"
                    textAlign="left"
                    transition="all 180ms ease"
                    _hover={{ borderColor: 'accent.400' }}
                    _focusVisible={{ outline: '2px solid', outlineColor: 'accent.400', outlineOffset: '2px' }}
                  >
                    <Flex align="start" justify="space-between" gap={3} w="100%">
                      <Box minW={0}>
                        <Text color="paper.bright" fontWeight="bold" fontSize="md" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" maxW="100%">
                          {item.name}
                        </Text>
                        <Text color="muted" fontSize="xs" fontFamily="mono" textTransform="uppercase" letterSpacing="0.08em">
                          {item.category}
                        </Text>
                      </Box>
                      <Box flexShrink={0} textAlign="right">
                        <Text color="paper.bright" fontSize="lg" fontWeight="bold" fontFamily="heading" lineHeight="short">
                          {formatEmeralds(item.price)}{' '}
                          <Box as="span" aria-label="emeralds">◆</Box>
                        </Text>
                        <Text color="paper.muted" fontSize="xs" fontFamily="mono" textTransform="uppercase" letterSpacing="0.1em">
                          Emeralds
                        </Text>
                      </Box>
                    </Flex>
                    <Flex gap={4} wrap="wrap" fontSize="xs" color="muted">
                      <Text as="span" data-testid="market-change">
                        <Box as="span" color={item.change_24h >= 0 ? 'mint.400' : 'red.300'} fontWeight="bold" mr={1}>
                          {item.change_24h > 0 ? '+' : ''}
                          {item.change_24h.toFixed(1)}%
                        </Box>
                        24h
                      </Text>
                      <Text as="span" data-testid="market-volume">
                        Vol {formatEmeralds(item.volume_24h)} sold
                      </Text>
                      <Text as="span" data-testid="market-activity">
                        {item.market_activity}
                      </Text>
                    </Flex>
                  </Button>
                </Box>
              );
            })}
          </Box>

          <Box
            border="1px solid"
            borderColor="line"
            rounded="lg"
            bg="ink.900"
            p={5}
            alignSelf="start"
            w="100%"
          >
            {selectedItem ? (
              <>
                <Heading as="h3" size="sm" color="paper.bright" mb={3}>
                  {selectedItem.name} — 24h trend
                </Heading>
                {trendStatus === 'loading' ? (
                  <Box data-testid="market-loading" color="muted" fontSize="sm" py={8} textAlign="center">
                    Loading trend…
                  </Box>
                ) : null}
                {trendStatus === 'error' ? (
                  <Box data-testid="market-trend-error" color="muted" fontSize="sm" py={8} textAlign="center">
                    Trend data could not be loaded.
                  </Box>
                ) : null}
                {trendStatus === 'success' && trend && trend.length === 0 ? (
                  <Box data-testid="market-trend-empty" color="muted" fontSize="sm" py={8} textAlign="center">
                    No trend data for this item.
                  </Box>
                ) : null}
                {trendStatus === 'success' && trend && trend.length > 0 ? (
                  <TrendChart name={selectedItem.name} points={trend} />
                ) : null}
              </>
            ) : null}
          </Box>
        </SimpleGrid>
      ) : null}
    </Box>
  );
}
