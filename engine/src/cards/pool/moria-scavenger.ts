import { defineCard } from "../define.js";

const TEXT =
  "{T}, Discard a card: Draw a card. If the discarded card was a creature card, amass Orcs 1.";

export default defineCard({
  name: "Moria Scavenger",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Rogue"],
  power: 1,
  toughness: 4,
  keywords: ["deathtouch", "haste"],
  text: `Deathtouch, haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "discarded", filter: { type: "creature" } },
            then: { kind: "amass", amount: 1, creatureType: "Orc" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
