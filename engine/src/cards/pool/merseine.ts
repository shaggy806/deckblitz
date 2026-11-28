import { defineCard } from "../define.js";

// Fallen Empires.
//
// The lock is Cocoon's: `doesnt-untap` on the enchanted creature, gated on the
// Aura's own net counters. "Pay enchanted creature's mana cost" is
// `cost.manaCostOf: "attached"`, read as it's activated (an {X} in it 0, rule
// 107.3h; a token or land enchanted has none to pay, rule 118.6), and only the
// enchanted creature's controller may activate it (`onlyBy: { controllerOf:
// "attached" }`, rule 602.1b) — they control the ability (602.2a),
// though "this Aura" is still Merseine.

const ENTERS = "This Aura enters with three net counters on it.";
const LOCK = "Enchanted creature doesn't untap during its controller's untap step if this Aura has a net counter on it.";
const PAY =
  "Pay enchanted creature's mana cost: Remove a net counter from this Aura. Only the controller of the enchanted creature may activate this ability.";

export default defineCard({
  name: "Merseine",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${LOCK}\n${PAY}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "net", amount: 3 } },
      text: ENTERS,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "self-counters", counter: "net", compare: { op: "gte", n: 1 } },
      restrictions: ["doesnt-untap"],
      text: LOCK,
    },
  ],
  activated: [
    {
      cost: { mana: null, manaCostOf: "attached", tap: false },
      onlyBy: { controllerOf: "attached" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "net", amount: 1 },
      resolve: null,
      text: PAY,
    },
  ],
});
