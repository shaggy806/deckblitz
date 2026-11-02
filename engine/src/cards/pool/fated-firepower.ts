import { defineCard } from "../define.js";

const ENTER_TEXT = "This enchantment enters with X fire counters on it.";
const TEXT =
  "If a source you control would deal damage to an opponent or a permanent an opponent controls, it deals that much damage plus an amount of damage equal to the number of fire counters on this enchantment instead.";

export default defineCard({
  name: "Fated Firepower",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fire", amount: "x" } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plusOf: { countersOnThis: "fire" },
        source: { controlledBy: "you" },
        to: "opponent-side",
      },
      text: TEXT,
    },
  ],
});
