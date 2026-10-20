import { defineCard } from "../define.js";

const TOKENS_TEXT = "When this creature enters, create two 1/1 white Bird creature tokens with flying.";

export default defineCard({
  name: "Soul of Migration",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  evoke: { cost: "{3}{W}" },
  text: `Flying\n${TOKENS_TEXT}\nEvoke {3}{W} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
  ],
});
