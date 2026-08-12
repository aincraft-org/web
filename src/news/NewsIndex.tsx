import { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { newsPosts } from './content';
import { NewsHero } from './components/NewsHero';
import { NewsPostList } from './components/NewsPostList';

export default function NewsIndex() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'News | AzothMC';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <Box as="section" data-testid="news-index" maxWidth="container.lg" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 14 }}>
      <NewsHero
        eyebrow="AZOTHMC / CHRONICLES"
        title="News"
        subtitle="Expedition notes, updates, and chronicles from the frontier."
      />
      <NewsPostList posts={newsPosts} />
    </Box>
  );
}
