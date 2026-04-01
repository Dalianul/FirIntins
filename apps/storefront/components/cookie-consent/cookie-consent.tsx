"use client"

import { useEffect } from "react"
import * as CookieConsentLib from "vanilla-cookieconsent"
import "vanilla-cookieconsent/dist/cookieconsent.css"
import { grantAnalyticsConsent, denyAnalyticsConsent } from "@/lib/analytics"

export function CookieConsent() {
  useEffect(() => {
    CookieConsentLib.run({
      guiOptions: {
        consentModal: {
          layout: "bar",
          position: "bottom",
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
        },
        marketing: {
          enabled: false,
        },
      },
      language: {
        default: "ro",
        translations: {
          ro: {
            consentModal: {
              title: "Setări cookie-uri",
              description:
                "Folosim cookie-uri esențiale, analitice și de marketing.",
              acceptAllBtn: "Acceptă toate",
              showPreferencesBtn: "Personalizează",
            },
            preferencesModal: {
              title: "Preferințe cookie-uri",
              savePreferencesBtn: "Salvează preferințele",
              sections: [
                {
                  title: "Necesare",
                  description: "Session, coș, autentificare.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Analitice",
                  description: "Trafic anonim.",
                  linkedCategory: "analytics",
                },
                {
                  title: "Marketing",
                  description: "Reclame personalizate.",
                  linkedCategory: "marketing",
                },
              ],
            },
          },
        },
      },
      onConsent: ({ cookie }: { cookie: { categories: string[] } }) => {
        if (cookie.categories.includes("analytics")) {
          grantAnalyticsConsent()
        }
      },
      onChange: ({ cookie }: { cookie: { categories: string[] } }) => {
        if (cookie.categories.includes("analytics")) {
          grantAnalyticsConsent()
        } else {
          denyAnalyticsConsent()
        }
      },
    })
  }, [])

  return null
}
