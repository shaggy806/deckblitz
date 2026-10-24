import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "{4}{G}{W}: This artifact becomes a 4/4 green and white Dragon artifact creature with flying until end of turn.";

export default defineCard({
  name: "Dromoka Monument",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {G} or {W}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {W}.",
    },
    {
      cost: { mana: "{4}{G}{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Dragon"],
        setColors: ["G", "W"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
