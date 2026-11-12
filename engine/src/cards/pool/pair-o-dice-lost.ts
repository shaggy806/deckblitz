import { defineCard } from "../define.js";

// EDHREC rank 11813. The cards aren't targeted: they're chosen after the roll
// (the ruling), any number of them with total mana value X or less — mana value
// 0 ones (lands) free. Exiled as it resolves, whatever was returned.

export default defineCard({
  name: "Pair o' Dice Lost",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Roll two six-sided dice. Return any number of cards with total mana value X or less from your graveyard to your hand, where X is the total of those results. Exile Pair o' Dice Lost.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 6,
    count: 2,
    then: {
      kind: "look-and-choose",
      zone: "graveyard",
      min: 0,
      max: { graveyardSize: "you" },
      destination: "hand",
      leftover: "stay",
      together: { totalManaValueAtMost: { roll: "total" } },
    },
  },
  exileOnResolve: true,
});
