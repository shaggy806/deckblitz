import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "{1}{G}{W}: Until end of turn, this land becomes a 3/4 green and white Elemental creature with reach. It's still a land.";

export default defineCard({
  name: "Stirring Wildwood",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {G} or {W}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {W}.",
    },
    {
      cost: { mana: "{1}{G}{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        setColors: ["G", "W"],
        keywords: ["reach"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
