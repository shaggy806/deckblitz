import { defineCard } from "../define.js";

// The replacement applies once to each life-gaining event (the rulings), and
// each Heron adds its own +1.
const REPLACE_TEXT = "If you would gain life, you gain that much life plus 1 instead.";
const LIFELINK_TEXT = "{1}{W}: This creature gains lifelink until end of turn.";

export default defineCard({
  name: "Heron of Hope",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${REPLACE_TEXT}\n${LIFELINK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", plus: 1 },
      text: REPLACE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK_TEXT,
    },
  ],
});
