import { defineCard } from "../define.js";

const TEXT = "This creature can't block creatures with power 3 or greater unless you pay {1}.";

// A cost to block (rule 509.1d), asked of the attacker as blocks are declared.
export default defineCard({
  name: "Hipparion",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      combatTax: { on: ["block"], generic: 1, attacker: { power: { op: "gte", n: 3 } } },
      text: TEXT,
    },
  ],
});
