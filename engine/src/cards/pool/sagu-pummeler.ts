import { defineCard } from "../define.js";

// EDHREC rank 20609.
//
// Rulings:
//   [2025-04-04] If a card with a renew ability is put into your graveyard during your turn, you
//     can activate that ability if it's legal to do so before any other player can take any
//     actions.

const RENEW_TEXT =
  "Renew — {4}{G}, Exile this card from your graveyard: Put two +1/+1 counters and a reach counter on target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Sagu Pummeler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${RENEW_TEXT}`,
  activated: [
    {
      // `zone: "graveyard"` pays "Exile this card from your graveyard" (renew, Kheru Goldkeeper).
      cost: { mana: "{4}{G}", tap: false },
      targets: ["creature"],
      // A reach counter is a keyword counter (rule 122.1b).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          { kind: "add-counter", target: 0, counter: "reach", amount: 1 },
        ],
      },
      resolve: null,
      text: RENEW_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
