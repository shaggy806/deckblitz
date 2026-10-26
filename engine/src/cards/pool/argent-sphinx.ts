import { defineCard } from "../define.js";

const TEXT =
  "Metalcraft — {U}: Exile this creature. Return it to the battlefield under your control at the beginning of the next end step. Activate only if you control three or more artifacts.";

// Returns under the activating player's control whatever the artifact count
// by then (the rulings) — Aetherling's flicker with `underYourControl`.
export default defineCard({
  name: "Argent Sphinx",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      condition: { kind: "metalcraft" },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        underYourControl: true,
        returnAt: "next-end-step",
        returnText: "Return Argent Sphinx to the battlefield under your control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
