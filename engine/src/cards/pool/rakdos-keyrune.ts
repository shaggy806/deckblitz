import { defineCard } from "../define.js";

// EDHREC rank 14385.
//
// Rulings:
//   Activating the ability while it's already a creature overrides effects that set its power
//     and/or toughness; effects that modify them still apply.
//   Until the ability resolves, the Keyrune is colorless.

const ANIMATE_TEXT =
  "{B}{R}: This artifact becomes a 3/1 black and red Devil artifact creature with first strike until end of turn.";

export default defineCard({
  name: "Rakdos Keyrune",
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
      cost: { mana: "{B}{R}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 1,
        addTypes: ["creature"],
        addSubtypes: ["Devil"],
        setColors: ["B", "R"],
        keywords: ["first-strike"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
