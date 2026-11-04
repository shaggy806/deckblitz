import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

const UPKEEP =
  "At the beginning of your upkeep, surveil 1. You win the game if there are eight or more different names among unlocked doors of Rooms you control.";

export default defineCard({
  name: "Promising Stairs",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UPKEEP}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // It counts names, not permanents: a Room with two unlocked doors has two
      // names, one with none has none (the rulings; `controls`' `distinctNames`).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Room" }, atLeast: 8, distinctNames: true },
            then: { kind: "win-game" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
