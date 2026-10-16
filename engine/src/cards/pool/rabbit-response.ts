import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 13380. The Rabbit is asked as the spell resolves, after
// the pump.
export default defineCard({
  name: "Rabbit Response",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +2/+1 until end of turn. If you control a Rabbit, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 2, toughness: 1, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Rabbit" }, atLeast: 1 },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});
