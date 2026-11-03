import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The right door of Moldering Gym // Weight Room (moldering-gym-weight-room.ts).
// "That creature" is the card manifest dread put onto the battlefield (rule
// 701.62a); with nothing manifested, no counters.
const UNLOCK = "When you unlock this door, manifest dread, then put three +1/+1 counters on that creature.";

export default defineCard({
  name: "Weight Room",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("right"),
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "manifest-dread" },
          { kind: "add-counter-all", filter: { thisWay: "put-onto-battlefield" }, counter: "+1/+1", amount: 3 },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Moldering Gym // Weight Room", "Moldering Gym", "Weight Room"],
  split: true,
});
