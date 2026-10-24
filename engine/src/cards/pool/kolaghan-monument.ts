import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "{4}{B}{R}: This artifact becomes a 4/4 black and red Dragon artifact creature with flying until end of turn.";

export default defineCard({
  name: "Kolaghan Monument",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {B} or {R}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {R}.",
    },
    {
      cost: { mana: "{4}{B}{R}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Dragon"],
        setColors: ["B", "R"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
