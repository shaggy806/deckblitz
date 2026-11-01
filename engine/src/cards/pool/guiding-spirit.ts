import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): `top-of-graveyard` over a target player's pile, `ifIt`
// reading the top card itself, and nothing done when it isn't a creature card.

const TEXT = "{T}: If the top card of target player's graveyard is a creature card, put that card on top of that player's library.";

export default defineCard({
  name: "Guiding Spirit",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Angel", "Spirit"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "top-of-graveyard",
        whose: 0,
        ifIt: { type: "creature" },
        then: { kind: "put-on-library", target: 0, position: "top" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
