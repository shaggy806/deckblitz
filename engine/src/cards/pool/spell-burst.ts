import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 10148.
//
// Spell Blast with buyback (Allay's shape): X is announced before targets are
// chosen, so the target filter reads it; a spell's mana value on the stack
// counts its own chosen X (the ruling).
//
// Rulings:
//   [2021-03-19] For spells with {X} in their mana costs, use the value chosen for X to determine
//     the spell's mana value.

export default defineCard({
  name: "Spell Burst",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCounter target spell with mana value X.",
  targets: [{ kind: "spell", filter: { manaValue: { op: "eq", n: "x" } } }],
  effect: { kind: "counter", target: 0 },
});
