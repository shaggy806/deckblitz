import { defineCard } from "../define.js";

const TRIGGER = "Whenever a creature deals combat damage to you, that creature's controller gains control of this land.";

// "You" is the land's current controller (the ruling); each creature's trigger
// hands it to that creature's controller, the last to resolve winning.
export default defineCard({
  name: "Contested War Zone",
  colors: [],
  types: ["land"],
  text: `${TRIGGER}\n{T}: Add {C}.\n{1}, {T}: Attacking creatures get +1/+0 until end of turn.`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "you", combat: true },
      targets: [],
      effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "trigger-controller" },
      resolve: null,
      text: TRIGGER,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      // Every attacking creature, not just yours (the ruling).
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}, {T}: Attacking creatures get +1/+0 until end of turn.",
    },
  ],
});
