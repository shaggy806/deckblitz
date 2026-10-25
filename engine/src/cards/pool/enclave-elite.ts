import { defineCard } from "../define.js";

// EDHREC rank 23990.

const ENTER_TEXT = "This creature enters with a +1/+1 counter on it for each time it was kicked.";

export default defineCard({
  name: "Enclave Elite",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["islandwalk"],
  text: `Multikicker {1}{U} (You may pay an additional {1}{U} any number of times as you cast this spell.)\nIslandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{U}", multi: true },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "times-kicked" } },
      text: ENTER_TEXT,
    },
  ],
});
