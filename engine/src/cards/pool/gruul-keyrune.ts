import { defineCard } from "../define.js";

// EDHREC rank 19724.
//
// Rulings:
//   [2013-04-15] Activating the ability that turns the Keyrune into a creature while it's already
//     a creature will override any effects that set its power and/or toughness to another number,
//     but effects that modify power and/or toughness without directly setting them will still
//     apply.
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.

const ANIMATE_TEXT =
  "{R}{G}: This artifact becomes a 3/2 red and green Beast artifact creature with trample until end of turn.";

export default defineCard({
  name: "Gruul Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {R} or {G}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {G}.",
    },
    {
      cost: { mana: "{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Beast"],
        setColors: ["R", "G"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
