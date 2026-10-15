import { defineCard } from "../define.js";

// EDHREC rank 20428.
//
// Tyvar, the Pummeler's "tap another untapped creature you control" cost,
// beside {1} and {T}.

const TAP_TEXT = "{1}, {T}, Tap another untapped creature you control: Tap target creature an opponent controls.";

export default defineCard({
  name: "Wanderbrine Trapper",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 1,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
