import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 23030.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.

const ANIMATE_TEXT =
  "{1}{W}{W}: This artifact becomes a 2/2 white Spirit artifact creature with flying and first strike until end of turn.";

export default defineCard({
  name: "Thunder Totem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {W}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      cost: { mana: "{1}{W}{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Spirit"],
        setColors: ["W"],
        keywords: ["flying", "first-strike"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
