import { defineCard } from "../define.js";

// EDHREC rank 28362. Future Sight.
//
// Bloodthirst 1 as Blood Ogre writes it; flanking as the scaffolder does.

export default defineCard({
  name: "Bogardan Lancer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["flanking"],
  text: "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)\nFlanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)",
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)",
    },
  ],
});
