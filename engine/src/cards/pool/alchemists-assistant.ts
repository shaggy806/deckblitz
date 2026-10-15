import { defineCard } from "../define.js";

// EDHREC rank 14568.

const RENEW_TEXT =
  "Renew — {1}{B}, Exile this card from your graveyard: Put a lifelink counter on target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Alchemist's Assistant",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Monkey"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${RENEW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["creature"],
      // A keyword counter (rule 122.1b).
      effect: { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 },
      resolve: null,
      text: RENEW_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
