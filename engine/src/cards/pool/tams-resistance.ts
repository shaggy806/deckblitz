import { defineCard } from "../define.js";

// EDHREC rank 26771.
// Makes Jace → "Jace Token".
//
// Rulings:
//   [2026-08-21] Some spells and abilities that empower Jace may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't empower Jace.
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token.
const COUNTER_TEXT = "Put a +1/+1 counter on up to one target creature. It gains vigilance until end of turn.";
const EMPOWER_TEXT =
  "Empower Jace 4. (Put four loyalty counters on a Jace token you control. If you don't control one, first create " +
  "a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";

export default defineCard({
  name: "Tam's Resistance",
  manaCost: "{1}{G/U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: `${COUNTER_TEXT}\n${EMPOWER_TEXT}`,
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "empower-jace", amount: 4 },
    ],
  },
});
