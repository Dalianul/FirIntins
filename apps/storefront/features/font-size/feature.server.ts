import { createServerFeature } from '@payloadcms/richtext-lexical'

/**
 * Adds a typed font-size input to the Lexical toolbar.
 * Editor types e.g. "18px" or "1.5rem" and presses Enter or blurs.
 * Stores the value as inline CSS via $patchStyleText.
 * Rendered on the frontend by the custom text JSX converter in rich-text-converters.tsx.
 */
export const FontSizeFeature = createServerFeature({
  key: 'inlineFontSize',
  feature: () => ({
    ClientFeature: '@/features/font-size/feature.client#FontSizeFeatureClient',
  }),
})
