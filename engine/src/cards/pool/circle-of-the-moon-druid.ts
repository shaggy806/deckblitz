import { defineCard } from "../define.js";

// EDHREC rank 21059. Goddric, Cloaked Reveler's shape: "is a Bear … (It loses
// all other creature types.)" is a layer-4 `setSubtypes`, base 4/2 layer 7b,
// both only during its controller's turn. "Bear Form" is an ability word.

const TEXT =
  "Bear Form — During your turn, this creature is a Bear with base power and toughness 4/2. (It loses all other creature types.)";

export default defineCard({
  name: "Circle of the Moon Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Druid"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      setSubtypes: ["Bear"],
      setBasePt: { power: 4, toughness: 2 },
      text: TEXT,
    },
  ],
});
