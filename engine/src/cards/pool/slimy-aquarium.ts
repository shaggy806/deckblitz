import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// "That creature" is the one manifest dread put onto the battlefield — none
// if the library was empty (the rulings).
const UNLOCK = "When you unlock this door, manifest dread, then put a +1/+1 counter on that creature.";

export default defineCard({
  name: "Slimy Aquarium",
  manaCost: "{3}{U}",
  colors: ["U"],
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
          { kind: "add-counter-all", filter: { thisWay: "put-onto-battlefield" }, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Underwater Tunnel // Slimy Aquarium", "Underwater Tunnel", "Slimy Aquarium"],
  split: true,
});
