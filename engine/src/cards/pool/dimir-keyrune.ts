import { defineCard } from "../define.js";

// EDHREC rank 7104.
//
// Rulings:
//   [2013-04-15] Activating the ability that turns the Keyrune into a creature while it's already
//     a creature will override any effects that set its power and/or toughness to another number,
//     but effects that modify power and/or toughness without directly setting them will still
//     apply.
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.
//
// Firdoch Core's animation with Creeping Tar Pit's colours and "can't be
// blocked this turn" (the `unblockable` keyword until end of turn).
const ANIMATE_TEXT =
  "{U}{B}: This artifact becomes a 2/2 blue and black Horror artifact creature until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Dimir Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {U} or {B}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "B"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U} or {B}.",
    },
    {
      cost: { mana: "{U}{B}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Horror"],
        setColors: ["U", "B"],
        keywords: ["unblockable"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
