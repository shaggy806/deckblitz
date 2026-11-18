import { defineCard } from "../define.js";

// EDHREC rank 14485.
//
// "A planeswalker that was activated this turn": one whose ability, any of
// them (loyalty, mana or other), was activated this turn, as the journal has
// it for this object (rule 400.7) — whether or not it still has that ability,
// and whatever became of the ability (its rulings).

export default defineCard({
  name: "Cut Short",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nDestroy target planeswalker that was activated this turn or tapped creature.",
  targets: [
    {
      kind: "permanent",
      filter: {
        anyOf: [
          { type: "planeswalker", journaled: { what: "abilities-activated" } },
          { type: "creature", tapped: true },
        ],
      },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
