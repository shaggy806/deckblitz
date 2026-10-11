import { defineCard } from "../define.js";

// EDHREC rank 6871.
//
// Shambling Vent's shape. Becoming a creature isn't entering, it's colorless
// until animated, and summoning sickness is the land's (the rulings).

const ANIMATE_TEXT =
  "{1}{B}{G}: Until end of turn, this land becomes a 2/2 black and green Elemental creature with deathtouch. It's still a land.";

export default defineCard({
  name: "Hissing Quagmire",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {B} or {G}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {G}.",
    },
    {
      cost: { mana: "{1}{B}{G}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        setColors: ["B", "G"],
        keywords: ["deathtouch"],
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
