// Re-exports createClientFeature via a relative file path so webpack resolves it
// as a direct file reference — bypassing the package exports-field restriction that
// blocks '@payloadcms/richtext-lexical/dist/utilities/createClientFeature.js'.
//
// WHY: @payloadcms/richtext-lexical/client starts with "use client". In SSR webpack
// replaces "use client" module exports with React client-reference proxies (not
// functions). Our feature.client.tsx files call createClientFeature() at module
// init time, so importing from /client causes "createClientFeature is not a function"
// on the server. The dist utility has no "use client" and works in both SSR and browser.
export { createClientFeature } from '../../node_modules/@payloadcms/richtext-lexical/dist/utilities/createClientFeature.js'
