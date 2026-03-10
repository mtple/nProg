export interface MetadataContent {
  mime: string;
  uri: string;
}

export interface TokenMetadata {
  name: string;
  description?: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  content?: MetadataContent;
  attributes?: Array<{ trait_type: string; value: string }>;
}
