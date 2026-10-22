import { defineCard } from "../define.js";

// EDHREC rank 25756. Fallen Empires.

const ENTERS = "This creature enters with a javelin counter on it.";
const THROW = "{T}, Remove a javelin counter from this creature: It deals 1 damage to any target.";

export default defineCard({
  name: "Icatian Javelineers",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${ENTERS}\n${THROW}`,
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "javelin", count: 1 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: THROW,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "javelin", amount: 1 } },
      text: ENTERS,
    },
  ],
});
