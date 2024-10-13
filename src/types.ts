export type IpfsUrl = string;
export type nftAttributeItem = {
  trait_type: string;
  value: string;
};
export type nftFormatMetaFormat = {
  name: string;
  description: string;
  external_url: string;
  image: IpfsUrl;
  attributes: nftAttributeItem[];
};
