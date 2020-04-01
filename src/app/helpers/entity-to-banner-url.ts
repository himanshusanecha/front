export default function entityToBannerUrl(
  entity: { guid: string; banner?: any } | null,
  top: number = 0
): string {
  if (!entity) {
    return '';
  }

  return `fs/v1/banners/${entity.guid}/${top}/${entity.banner}`;
}
