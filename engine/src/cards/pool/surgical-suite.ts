import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Surgical Suite // Hospital Room (surgical-suite-hospital-room.ts).
const UNLOCK =
  "When you unlock this door, return target creature card with mana value 3 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Surgical Suite",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Surgical Suite // Hospital Room", "Surgical Suite", "Hospital Room"],
  split: true,
});
