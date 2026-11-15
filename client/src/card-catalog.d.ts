// The card catalog's pieces, served by the `cardCatalog` plugin in
// `vite.config.ts` (see `cards/catalogChunks.ts`).
declare module 'virtual:card-catalog/*' {
  const chunk: import('engine/client').CatalogChunk
  export default chunk
}
