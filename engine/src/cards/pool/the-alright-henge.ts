import { defineCard } from "../define.js";

// Playtest card: The Great Henge's counter half, without its draw or its cost
// reduction.

const ENTERS = "Whenever a nontoken creature enters the battlefield under your control, put a +1/+1 counter on it.";

export default defineCard({
  name: "The Alright Henge",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: `{T}: Add {G}{G}.\n${ENTERS}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 2 },
      resolve: null,
      text: "{T}: Add {G}{G}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
