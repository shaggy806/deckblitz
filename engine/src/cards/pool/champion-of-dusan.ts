import { defineCard } from "../define.js";

// EDHREC rank 14689.
//
// Rulings:
//   [2025-04-04] If a card with a renew ability is put into your graveyard during your turn, you
//     can activate that ability if it's legal to do so before any other player can take any
//     actions.

const RENEW_TEXT =
  "Renew — {1}{G}, Exile this card from your graveyard: Put a +1/+1 counter and a trample counter on target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Champion of Dusan",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${RENEW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          // A keyword counter (rule 122.1b).
          { kind: "add-counter", target: 0, counter: "trample", amount: 1 },
        ],
      },
      resolve: null,
      text: RENEW_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
