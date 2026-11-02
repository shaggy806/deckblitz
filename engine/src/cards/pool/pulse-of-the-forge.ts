import { defineCard } from "../define.js";

// "That player or that planeswalker's controller": `controllerOfTarget` is the
// player in the slot, or the controller of the object in it. Asked of life
// totals after the damage (rule 608.2c), and a planeswalker the damage has
// finished is still there: state-based actions wait for the resolution to end.
export default defineCard({
  name: "Pulse of the Forge",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Pulse of the Forge deals 4 damage to target player or planeswalker. Then if that player or that planeswalker's controller has more life than you, return Pulse of the Forge to its owner's hand.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "life", compare: "fewer", than: { controllerOfTarget: 0 } },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
