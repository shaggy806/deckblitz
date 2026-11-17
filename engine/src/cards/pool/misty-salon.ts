import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The right door of Smoky Lounge // Misty Salon (smoky-lounge-misty-salon.ts).
// X is counted once, as the ability resolves (its ruling), this Room's own
// unlocked doors among them.
const UNLOCK =
  "When you unlock this door, create an X/X blue Spirit creature token with flying, where X is the number of unlocked doors among Rooms you control.";

const X: EffectAmount = { aggregate: "sum", of: "unlocked-doors", filter: { subtype: "Room", controlledBy: "you" } };

export default defineCard({
  name: "Misty Salon",
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
        kind: "create-token",
        token: "Spirit Token (Unwilling Vessel)",
        count: 1,
        basePt: { power: X, toughness: X },
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Smoky Lounge // Misty Salon", "Smoky Lounge", "Misty Salon"],
  split: true,
});
