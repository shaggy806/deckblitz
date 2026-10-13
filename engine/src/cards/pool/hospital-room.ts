import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Surgical Suite // Hospital Room (surgical-suite-hospital-room.ts).
const ATTACK = "Whenever you attack, put a +1/+1 counter on target attacking creature.";

export default defineCard({
  name: "Hospital Room",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${ATTACK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK,
    },
  ],
  faces: ["Surgical Suite // Hospital Room", "Surgical Suite", "Hospital Room"],
  split: true,
});
