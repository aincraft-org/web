import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

const styles: Record<string, object> = {
  '& h2': { marginTop: 8, marginBottom: 3, fontSize: '1.5rem', fontWeight: 700 },
  '& h3': { marginTop: 6, marginBottom: 2, fontSize: '1.15rem', fontWeight: 700 },
  '& p': { marginBottom: 4 },
  '& ul': { marginBottom: 4, paddingLeft: 5 },
  '& ol': { marginBottom: 4, paddingLeft: 5 },
  '& li': { marginBottom: 1 },
  '& a': { textDecoration: 'underline' },
  '& code': { backgroundColor: 'blackAlpha.100', padding: '2px 6px', borderRadius: 3, fontFamily: 'mono', fontSize: '0.88em' },
  '& pre': { padding: 4, overflowX: 'auto', backgroundColor: 'blackAlpha.100', borderRadius: 'lg', marginBottom: 4 },
  '& pre code': { backgroundColor: 'transparent', padding: 0 },
  '& blockquote': { borderLeft: '3px solid', borderLeftColor: 'blackAlpha.300', paddingLeft: 4, color: 'blackAlpha.700', marginTop: 5, marginBottom: 5 },
};

interface ArticleBodyProps {
  body: string;
}

export function ArticleBody({ body }: ArticleBodyProps) {
  return (
    <Box as="article" data-testid="article-body" lineHeight="tall" maxWidth="78ch" css={styles}>
      <ReactMarkdown>{body}</ReactMarkdown>
    </Box>
  );
}
