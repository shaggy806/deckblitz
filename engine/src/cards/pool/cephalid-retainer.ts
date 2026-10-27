import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 27045. Flood's ability on a body.

const TEXT = "{U}{U}: Tap target creature without flying.";

export default defineCard({
  name: "Cephalid Retainer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
