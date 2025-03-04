export const get721Metadata = (
  name: string,
  attributes?: Record<string, unknown>,
): AssetMetadata => {
  return {
    ...attributes,
    files: [
      {
        mediaType: "image/png",
        name: name,
        src: "ipfs://QmPS4PBvpGc2z6Dd6JdYqfHrKnURjtRGPTJWdhnAXNA8bQ",
      },
    ],
    image: "ipfs://QmPS4PBvpGc2z6Dd6JdYqfHrKnURjtRGPTJWdhnAXNA8bQ",
    mediaType: "image/png",
    name: name,
  };
};

export type AssetMetadata = {
  files: {
    mediaType: string;
    name: string;
    src: string;
  }[];
  image: string;
  mediaType: string;
  name: string;
};
