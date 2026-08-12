import { Box, chakra, Heading, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { NewsPost } from '../content';
const RouterLink = chakra(Link);

interface NewsPostListProps {
  posts: NewsPost[];
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}

export function NewsPostList({ posts }: NewsPostListProps) {
  if (!posts.length) {
    return (
      <Text data-testid="news-empty" color="muted" border="1px dashed" borderColor="line" p={10} textAlign="center">
        No chronicles yet — check back soon.
      </Text>
    );
  }

  return (
    <Box as="ul" data-testid="news-post-list" listStyle="none" m={0} p={0} display="grid" gap={4}>
      {posts.map((post) => (
        <Box
          as="li"
          key={post.slug}
          data-testid="news-post"
          data-date={post.date}
          p={5}
          border="1px solid"
          borderColor="line"
          borderLeft="3px solid"
          borderLeftColor="accent.400"
          borderRadius="lg"
          bg="ink.800"
        >
          <VStack align="start" gap={1}>
            <chakra.time dateTime={post.date} color="mint.400" fontFamily="mono" fontSize="xs">
              {formatDate(post.date)}
            </chakra.time>
            <Heading as="h2" size="md" color="paper.bright">
              <RouterLink to={`/news/${post.slug}`}>{post.title}</RouterLink>
            </Heading>
            <Text color="muted" fontSize="sm">
              {post.summary}
            </Text>
          </VStack>
        </Box>
      ))}
    </Box>
  );
}
