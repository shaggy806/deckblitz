import { defineCard } from "../define.js";

// EDHREC rank 16973. Dimir Keyrune's shape with Shambling Vent's colours and
// lifelink.
//
// Rulings:
//   [2013-04-15] Multiple instances of lifelink on the same creature are redundant. Activating the
//     last ability multiple times won't cause you to gain more life.
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.

const ANIMATE_TEXT =
  "{W}{B}: This artifact becomes a 1/4 white and black Thrull artifact creature with lifelink until end of turn.";

export default defineCard({
  name: "Orzhov Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {W} or {B}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "B"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {B}.",
    },
    {
      cost: { mana: "{W}{B}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 1,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Thrull"],
        setColors: ["W", "B"],
        keywords: ["lifelink"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
