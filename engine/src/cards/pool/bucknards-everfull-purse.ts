import { defineCard } from "../define.js";

// The instruction to roll, the Treasures and the control change are all one ability: nobody gets
// to respond in between (the rulings).
const TEXT =
  "{1}, {T}: Roll a d4 and create a number of Treasure tokens equal to the result. The player to your right gains control of this artifact.";

export default defineCard({
  name: "Bucknard's Everfull Purse",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "roll-dice",
            sides: 4,
            then: { kind: "create-token", token: "Treasure Token", count: { roll: "total" } },
          },
          { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "player-to-your-right" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
