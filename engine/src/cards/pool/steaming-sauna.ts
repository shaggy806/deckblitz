import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Roaring Furnace // Steaming Sauna
// (roaring-furnace-steaming-sauna.ts). Effects on the maximum hand size apply
// in timestamp order, and this door's is the time it was unlocked when that's
// after the Room entered (its ruling; rule 613.7a): unlocked after a "your
// maximum hand size is two" permanent entered, there's no maximum.
const NO_MAX = "You have no maximum hand size.";
const DRAW = "At the beginning of your end step, draw a card.";

export default defineCard({
  name: "Steaming Sauna",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${NO_MAX}\n${DRAW}\n${ROOM_REMINDER}`,
  static: [{ affects: { scope: "self" }, noMaxHandSize: true, text: NO_MAX }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  faces: ["Roaring Furnace // Steaming Sauna", "Roaring Furnace", "Steaming Sauna"],
  split: true,
});
