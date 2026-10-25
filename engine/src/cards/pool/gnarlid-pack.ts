import { defineCard } from "../define.js";

// EDHREC rank 23732.

const ENTER_TEXT = "This creature enters with a +1/+1 counter on it for each time it was kicked.";

export default defineCard({
  name: "Gnarlid Pack",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: `Multikicker {1}{G} (You may pay an additional {1}{G} any number of times as you cast this spell.)\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{G}", multi: true },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "times-kicked" } },
      text: ENTER_TEXT,
    },
  ],
});
