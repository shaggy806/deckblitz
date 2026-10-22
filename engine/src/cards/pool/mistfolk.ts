import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 30009.

const TEXT = "{U}: Counter target spell that targets this creature.";

export default defineCard({
  name: "Mistfolk",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "spell", filter: { targets: { source: true } } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
