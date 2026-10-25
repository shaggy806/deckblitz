import { defineCard } from "../define.js";

const ENTER_TEXT = "This creature enters with a +1/+1 counter on it for each time it was kicked.";

export default defineCard({
  name: "Quag Vampires",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["swampwalk"],
  text: `Multikicker {1}{B} (You may pay an additional {1}{B} any number of times as you cast this spell.)\nSwampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{B}", multi: true },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "times-kicked" } },
      text: ENTER_TEXT,
    },
  ],
});
