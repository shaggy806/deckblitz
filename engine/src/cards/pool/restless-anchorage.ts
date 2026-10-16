import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "{1}{W}{U}: Until end of turn, this land becomes a 2/3 white and blue Bird creature with flying. It's still a land.";

export default defineCard({
  name: "Restless Anchorage",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {W} or {U}.\n${ANIMATE_TEXT}\nWhenever this land attacks, create a Map token.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
    {
      cost: { mana: "{1}{W}{U}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Bird"],
        setColors: ["W", "U"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      // Whatever made it a creature (the ruling).
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Map Token", count: 1 },
      resolve: null,
      text: "Whenever this land attacks, create a Map token.",
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
