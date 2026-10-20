import { defineCard } from "../define.js";

const CONVERGE_TEXT =
  "Converge — This creature enters with two +1/+1 counters on it for each color of mana spent to cast it.";
const EVASION_TEXT = "This creature can't be blocked by creatures with power 2 or less.";

export default defineCard({
  name: "Glinting Creeper",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant"],
  power: 0,
  toughness: 0,
  text: `${CONVERGE_TEXT}\n${EVASION_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { product: [{ colorsSpentOf: "source" }, 2] } },
      },
      text: CONVERGE_TEXT,
    },
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: EVASION_TEXT,
    },
  ],
});
