import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Experimental Lab // Staff Room: the choice is made as the
// trigger resolves; turning a face-up creature "face up" does nothing.
const DAMAGE =
  "Whenever a creature you control deals combat damage to a player, turn that creature face up or put a +1/+1 counter on it.";
const FACES = ["Experimental Lab // Staff Room", "Experimental Lab", "Staff Room"];

export default defineCard({
  name: "Staff Room",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${DAMAGE}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Turn that creature face up.", effect: { kind: "turn-face-up", target: "trigger-object" } },
          {
            text: "Put a +1/+1 counter on it.",
            effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: DAMAGE,
    },
  ],
  faces: FACES,
  split: true,
});
