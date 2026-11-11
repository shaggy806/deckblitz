import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Roaring Furnace // Steaming Sauna
// (roaring-furnace-steaming-sauna.ts). The hand is counted as the trigger
// resolves.
const UNLOCK =
  "When you unlock this door, this Room deals damage equal to the number of cards in your hand to target creature an opponent controls.";

export default defineCard({
  name: "Roaring Furnace",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", target: 0, amount: { cardsInHand: "you" } },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Roaring Furnace // Steaming Sauna", "Roaring Furnace", "Steaming Sauna"],
  split: true,
});
