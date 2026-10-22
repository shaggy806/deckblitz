import { defineCard } from "../define.js";

// The trigger condition compares the spell's mana value (its {X} included —
// a ruling) with the doom counters as it's cast. "That much" is that number as
// it triggered (a ruling): the spell's mana value, read off the spell — as it
// last was on the stack if it's been countered (the trigger still resolves —
// a ruling) — not the counters now, which a second trigger may have raised.
// With its target illegal the ability doesn't resolve, so no counter either.
const CAST_TEXT =
  "Whenever you cast a spell with mana value equal to the number of doom counters on this enchantment, this enchantment deals that much damage to any target. Then put a doom counter on this enchantment.";

export default defineCard({
  name: "Imminent Doom",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `This enchantment enters with a doom counter on it.\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "doom", amount: 1 } },
      text: "This enchantment enters with a doom counter on it.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "doom" } } } },
      },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { manaValueOf: "trigger-object" }, target: 0 },
          { kind: "add-counter", target: "source", counter: "doom", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
