import { defineCard } from "../define.js";

// Dissension. EDHREC rank 24095.
//
// The damage is the mana value of the card discarded this way, read in the
// graveyard it went to; nothing discarded (an empty hand) deals 0.

const TEXT =
  "When this creature enters, target player discards a card. This creature deals damage to that player equal to that card's mana value.";

export default defineCard({
  name: "Hellhole Rats",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: 0, amount: 1 },
          { kind: "damage", amount: { thisWay: "discarded", sumOf: "mana-value" }, target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
