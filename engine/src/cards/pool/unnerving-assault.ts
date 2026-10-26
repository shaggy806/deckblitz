import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 31512.
//
// Each half asks, as the spell resolves, whether any mana of its colour was
// spent on the whole cost (the rulings); a copy had none spent. Only the
// creatures on the battlefield then are affected.

const TEXT =
  "Creatures your opponents control get -1/-0 until end of turn if {U} was spent to cast this spell, and creatures you control get +1/+0 until end of turn if {R} was spent to cast this spell. (Do both if {U}{R} was spent.)";

export default defineCard({
  name: "Unnerving Assault",
  manaCost: "{2}{U/R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { U: 1 } } },
        then: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "opponent" },
          power: -1,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { R: 1 } } },
        then: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
