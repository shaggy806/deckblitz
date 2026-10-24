import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "{4}{W}{U}: This artifact becomes a 4/4 white and blue Dragon artifact creature with flying until end of turn.";

export default defineCard({
  name: "Ojutai Monument",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {W} or {U}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
    {
      cost: { mana: "{4}{W}{U}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Dragon"],
        setColors: ["W", "U"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
