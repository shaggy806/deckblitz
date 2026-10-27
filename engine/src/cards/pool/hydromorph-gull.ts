import { defineCard } from "../define.js";

// Torment. EDHREC rank 29054.

const TEXT = "{U}, Sacrifice this creature: Counter target spell that targets a creature you control.";

export default defineCard({
  name: "Hydromorph Gull",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Bird"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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
