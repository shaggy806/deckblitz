import { defineCard } from "../define.js";

// EDHREC rank 18002. Joraga Warcaller's multikicker counters.

const ENTER_TEXT = "This creature enters with a +1/+1 counter on it for each time it was kicked.";

export default defineCard({
  name: "Skitter of Lizards",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Multikicker {1}{R} (You may pay an additional {1}{R} any number of times as you cast this spell.)\nHaste\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{R}", multi: true },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "times-kicked" } },
      text: ENTER_TEXT,
    },
  ],
});
