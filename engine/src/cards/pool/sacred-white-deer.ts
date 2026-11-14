import { defineCard } from "../define.js";

// EDHREC rank 31145.

const LIFE_TEXT = "{3}{G}, {T}: You gain 4 life. Activate only if you control a Yanggu planeswalker.";

export default defineCard({
  name: "Sacred White Deer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 2,
  toughness: 2,
  text: LIFE_TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: true },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Yanggu" }, atLeast: 1 },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
