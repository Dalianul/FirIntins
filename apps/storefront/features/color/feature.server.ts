import { createServerFeature } from '@payloadcms/richtext-lexical'

/**
 * Adds an arbitrary hex color picker to the Lexical toolbar.
 * Stores the selected color as an inline CSS string via $patchStyleText.
 * Rendered on the frontend by the custom text JSX converter in rich-text-converters.tsx.
 */
export const ColorFeature = createServerFeature({
  key: 'inlineColor',
  feature: () => ({
    ClientFeature: '@/features/color/feature.client#ColorFeatureClient',
  }),
})
