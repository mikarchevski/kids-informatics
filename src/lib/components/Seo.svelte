<script lang="ts">
	import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '#lib/seo';

	type Props = {
		title: string;
		description: string;
		path?: string;
		image?: string;
		type?: 'website' | 'article';
		noIndex?: boolean;
		schema?: Record<string, unknown>;
	};

	let {
		title,
		description,
		path,
		image = '/favicon.png',
		type = 'website',
		noIndex = false,
		schema
	}: Props = $props();

	const organization = {
		'@type': 'EducationalOrganization',
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		logo: new URL('/favicon.png', SITE_URL).href,
		sameAs: ['https://github.com/mikarchevski/kids-informatics']
	};
	const website = {
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		name: SITE_NAME,
		url: SITE_URL,
		inLanguage: 'ru-RU',
		publisher: { '@id': `${SITE_URL}/#organization` }
	};
	const canonicalUrl = $derived(path ? new URL(path, SITE_URL).href : undefined);
	const structuredData = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@graph': [
				{ ...organization, '@id': `${SITE_URL}/#organization` },
				website,
				...(schema ? [schema] : [])
			]
		}).replace(/[<\u2028\u2029]/g, (character) => {
			const escapes: Record<string, string> = {
				'<': '\\u003c',
				'\u2028': '\\u2028',
				'\u2029': '\\u2029'
			};
			return escapes[character];
		})
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
	{#if canonicalUrl}
		<link rel="canonical" href={canonicalUrl} />
	{/if}
	<meta property="og:locale" content="ru_RU" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if canonicalUrl}
		<meta property="og:url" content={canonicalUrl} />
	{/if}
	<meta property="og:image" content={new URL(image, SITE_URL).href} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={new URL(image, SITE_URL).href} />
</svelte:head>

{@html `<script type="application/ld+json">${structuredData}</script>`}
