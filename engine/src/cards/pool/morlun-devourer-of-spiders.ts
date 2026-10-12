import { defineCard } from "../define.js";

// EDHREC rank 9357.

// Endless One's X counters and Ajani's Anguish's enters-for-X damage: X is
// the X paid as it was cast (0 if it entered any other way).
const COUNTERS_TEXT = "Morlun enters with X +1/+1 counters on him.";
const DAMAGE_TEXT = "When Morlun enters, he deals X damage to target opponent.";

export default defineCard({
  name: "Morlun, Devourer of Spiders",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Villain"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${COUNTERS_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: COUNTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
