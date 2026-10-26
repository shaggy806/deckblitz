import { defineCard } from "../define.js";

// EDHREC rank 27988. Bloodthirst 1 (rule 702.54a) is an enters replacement
// gated on an opponent having been dealt damage this turn — Embereth
// Paladin's shape with a turn-stat condition.

const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";

export default defineCard({
  name: "Blood Ogre",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `${BLOODTHIRST}\nFirst strike (This creature deals combat damage before creatures without first strike.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: BLOODTHIRST,
    },
  ],
});
