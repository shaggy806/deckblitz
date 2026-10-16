import { defineCard } from "../define.js";

// EDHREC rank 21130.

const ATTACK_TEXT =
  "Whenever this creature attacks, target creature you control without flying gets +1/+1 until end of turn.";

export default defineCard({
  name: "Seedpod Squire",
  manaCost: "{3}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
