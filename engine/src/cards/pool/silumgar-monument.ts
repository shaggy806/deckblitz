import { defineCard } from "../define.js";

// EDHREC rank 20475. Atarka Monument's shape.
const ANIMATE_TEXT =
  "{4}{U}{B}: This artifact becomes a 4/4 blue and black Dragon artifact creature with flying until end of turn.";

export default defineCard({
  name: "Silumgar Monument",
  manaCost: "{3}",
  types: ["artifact"],
  text: `{T}: Add {U} or {B}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "B"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U} or {B}.",
    },
    {
      cost: { mana: "{4}{U}{B}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Dragon"],
        setColors: ["U", "B"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
