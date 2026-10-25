import { defineCard } from "../define.js";

// EDHREC rank 10955.
// Makes Eldrazi Scion → "Eldrazi Scion Token".
//
// Rulings:
//   [2016-01-22] Vile Redeemer's last ability won't count nontoken creatures that didn't go to a
//     graveyard because of a replacement effect (for example, a creature that was exiled instead).
//   [2016-01-22] Vile Redeemer's last ability will count any nontoken creature that died while
//     under your control, even if you weren't the creature's owner. It doesn't matter where the
//     card is as the ability resolves. It doesn't have to still be in a graveyard.

const CAST_TEXT =
  "When you cast this spell, you may pay {C}. If you do, create a 1/1 colorless Eldrazi Scion creature token for each nontoken creature that died under your control this turn. Those tokens have \"Sacrifice this token: Add {C}.\"";

export default defineCard({
  name: "Vile Redeemer",
  manaCost: "{2}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Devoid (This card has no color.)\nFlash\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {C} to create an Eldrazi Scion for each nontoken creature that died under your control this turn?",
        cost: "{C}",
        // The died list is the creatures that died under your control, as they
        // last were (Tobias, Doomed Conqueror) — counted as this resolves.
        effect: {
          kind: "create-token",
          token: "Eldrazi Scion Token",
          count: { turnHistory: "died", filter: { type: "creature", token: false } },
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
