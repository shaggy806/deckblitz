import { defineCard } from "../define.js";

// EDHREC rank 19443. Return to Ravnica.
//
// Rulings:
//   Until the ability resolves, the Keyrune is colorless.
//   Activating the ability while it's already a creature overrides effects that set its power
//     and/or toughness; effects that modify them still apply.

const ANIMATE_TEXT = "{G}{W}: This artifact becomes a 3/3 green and white Wolf artifact creature until end of turn.";

export default defineCard({
  name: "Selesnya Keyrune",
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
      cost: { mana: "{G}{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Wolf"],
        setColors: ["G", "W"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
