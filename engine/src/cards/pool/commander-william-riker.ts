import { defineCard } from "../define.js";

// EDHREC rank 27906.

const DRAW_TEXT = "{1}, {T}: You and target opponent each draw two cards.";

export default defineCard({
  name: "Commander William Riker",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "haste"],
  text: `Vigilance, haste\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "draw", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
