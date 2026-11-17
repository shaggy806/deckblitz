import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The left door of Smoky Lounge // Misty Salon (smoky-lounge-misty-salon.ts).
// The mana pays for a Room spell (either door cast) or a door's unlock cost
// (rule 709.5e, a special action) and nothing else (rule 106.6).
const MAIN =
  "At the beginning of your first main phase, add {R}{R}. Spend this mana only to cast Room spells and unlock doors.";

export default defineCard({
  name: "Smoky Lounge",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${MAIN}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 2,
        spendOnly: {
          spell: { subtype: "Room" },
          purposes: ["unlock-door"],
          text: "Spend this mana only to cast Room spells and unlock doors.",
        },
      },
      resolve: null,
      text: MAIN,
    },
  ],
  faces: ["Smoky Lounge // Misty Salon", "Smoky Lounge", "Misty Salon"],
  split: true,
});
