"use client"

import { useEffect } from "react"
import CookieConsentLib from "vanilla-cookieconsent"
import "vanilla-cookieconsent/dist/cookieconsent.css"

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
    })
  }, [])

  return null
}
