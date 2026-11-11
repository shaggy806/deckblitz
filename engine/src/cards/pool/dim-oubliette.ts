import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Polluted Cistern // Dim Oubliette
// (polluted-cistern-dim-oubliette.ts). The creature card is chosen as it
// resolves, not targeted: one of the milled cards or any other.
const UNLOCK_TEXT =
  "When you unlock this door, mill three cards, then return a creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Dim Oubliette",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK_TEXT}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "door-unlocked", who: "self", door: "right" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 1,
            max: 1,
            filter: { type: "creature" },
            destination: "battlefield",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: UNLOCK_TEXT,
    },
  ],
  faces: ["Polluted Cistern // Dim Oubliette", "Polluted Cistern", "Dim Oubliette"],
  split: true,
});
