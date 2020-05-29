/**
 * Determine the entity's media content type
 */
export default function getEntityContentType(
  entity
): 'image' | 'video' | 'blog' | 'status' {
  const e = entity;
  if (e.perma_url && (e.entity_guid || (e.subtype && e.subtype === 'blog'))) {
    return 'blog';
  }
  if (e.custom_type && e.custom_type === 'video') {
    return 'video';
  }
  if (e.custom_type && e.custom_type === 'batch') {
    return 'image';
  }
  return 'status';
}
