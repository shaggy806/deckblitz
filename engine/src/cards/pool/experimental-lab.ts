import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Experimental Lab // Staff Room. "That creature" is the one
// manifest dread put onto the battlefield this way.
const UNLOCK =
  "When you unlock this door, manifest dread, then put two +1/+1 counters and a trample counter on that creature.";
const FACES = ["Experimental Lab // Staff Room", "Experimental Lab", "Staff Room"];

export default defineCard({
  name: "Experimental Lab",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      effect: {
        kind: "sequence",
        together: true,
        effects: [
          { kind: "manifest-dread" },
          { kind: "add-counter-all", filter: { thisWay: "put-onto-battlefield" }, counter: "+1/+1", amount: 2 },
          { kind: "add-counter-all", filter: { thisWay: "put-onto-battlefield" }, counter: "trample", amount: 1 },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: FACES,
  split: true,
});
