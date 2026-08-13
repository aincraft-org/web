import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, chakra, Heading, Stack, Text } from '@chakra-ui/react';
import { getPost } from './content';
import { ArticleBody } from './components/ArticleBody';
import { NewsHero } from './components/NewsHero';
const RouterLink = chakra(Link);

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug ?? '');

  useEffect(() => {
    if (!post) return undefined;
    const previousTitle = document.title;
    document.title = `${post.title} | AzothMC`;
    return () => { document.title = previousTitle; };
  }, [post]);

  if (!post) {
    return (
      <Box as="section" maxWidth="container.lg" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 14 }}>
        <NewsHero
          eyebrow="AZOTHMC / CHRONICLES"
          title="Post not found"
          subtitle="This chronicle does not exist — it may have been moved."
        />
        <Stack align="start" mt={8} data-testid="news-not-found">
          <Text color="blackAlpha.600" fontSize="sm">
            <RouterLink to="/news">Back to all news</RouterLink>
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box as="section" maxWidth="container.lg" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 14 }}>
      <NewsHero eyebrow="AZOTHMC / CHRONICLES" title={post.title} subtitle={formatDate(post.date)} />
      <Box as="header" mt={8}>
        <Heading as="h2" size="2xl" display="none" aria-hidden="true">{post.title}</Heading>
      </Box>
      <ArticleBody body={post.body} />
    </Box>
  );
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}
