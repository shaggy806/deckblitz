import { defineCard } from "../define.js";

// EDHREC rank 26050. Joraga Warcaller's multikicker counters.

const ENTER_TEXT = "This creature enters with a +1/+1 counter on it for each time it was kicked.";

export default defineCard({
  name: "Apex Hawks",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Multikicker {1}{W} (You may pay an additional {1}{W} any number of times as you cast this spell.)\nFlying\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{W}", multi: true },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "times-kicked" } },
      text: ENTER_TEXT,
    },
  ],
});
