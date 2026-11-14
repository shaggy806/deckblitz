import { defineCard } from "../define.js";

// EDHREC rank 16104. The {U} is offered once some one opponent has had two or
// more creatures enter under their control this turn (`of-player` over each
// opponent — not two opponents' one each). The targets needn't be those
// creatures (the ruling).
//
// Rulings:
//   You must target two creatures as you cast Whiplash Trap. If you can't (because just one
//     creature is on the battlefield, perhaps), you can't cast the spell.
//   You can target any two creatures, not just ones that entered this turn.
export default defineCard({
  name: "Whiplash Trap",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent had two or more creatures enter the battlefield under their control this turn, you may pay {U} rather than pay this spell's mana cost.\nReturn two target creatures to their owners' hands.",
  alternativeCost: {
    mana: "{U}",
    condition: {
      kind: "of-player",
      player: "an-opponent",
      condition: { kind: "turn-history", what: "entered", who: "you", filter: { type: "creature" }, atLeast: 2 },
    },
  },
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
