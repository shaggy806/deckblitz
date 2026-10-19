import { defineCard } from "../define.js";

// EDHREC rank 12411.
// Bucolic Ranch's look: a land card may go onto the battlefield tapped (min
// 0); a card not put there may then go to the bottom (`secondPick`, asked
// only of what the first pick left), or stay on top.

const LOOK =
  "{4}, {T}: Look at the top card of your library. If it's a land card, you may put it onto the battlefield tapped. If you don't put the card onto the battlefield, you may put it on the bottom of your library.";

export default defineCard({
  name: "Lantern of Revealing",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add one mana of any color.\n${LOOK}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        secondPick: { min: 0, max: 1, destination: "library-bottom" },
        leftover: "stay",
      },
      resolve: null,
      text: LOOK,
    },
  ],
});
