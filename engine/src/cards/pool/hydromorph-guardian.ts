import { defineCard } from "../define.js";

// Torment. EDHREC rank 26890.

const TEXT = "{U}, Sacrifice this creature: Counter target spell that targets a creature you control.";

export default defineCard({
  name: "Hydromorph Guardian",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [{ kind: "spell", filter: { targets: { permanent: { type: "creature", controlledBy: "you" } } } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
