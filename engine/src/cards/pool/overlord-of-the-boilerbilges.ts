import { defineCard } from "../define.js";
import { impendingAbilities } from "../helpers.js";

// EDHREC rank 4612.
//
// Rulings:
//   [2024-09-20] "Impending N–[cost]" is a keyword that represents multiple abilities. The
//     official rules are as follows: (a) You may choose to pay [cost] rather than pay this spell's
//     mana cost. (b) If you chose to pay this spell's impending cost, it enters the battlefield
//     with N time counters on it. (c) As long as this permanent has a time counter on it, if it
//     was cast for its impending cost, it's not a creature. (d) At the beginning of your end step,
//     if this permanent was cast for its impending cost, remove a time counter from it.
//   [2024-09-20] If an object enters as a copy of a permanent that was cast with its impending
//     cost, it won't enter with time counters, and it will be a creature.
//   [2024-09-20] If you choose to pay the impending cost of a creature spell, it's still a
//     creature spell on the stack. You can cast that spell for its impending cost only when you
//     could normally cast that creature spell. Most of the time, this means during your main phase
//     when the stack is empty.
//   [2024-09-20] If you choose to pay the impending cost rather than the mana cost, you're still
//     casting the spell. It goes on the stack and can be responded to, countered, and so on.

const TRIGGER_TEXT = "Whenever this permanent enters or attacks, it deals 4 damage to any target.";
const TARGETS = ["any-target"] as const;
const EFFECT = { kind: "damage", amount: 4, target: 0 } as const;
const IMPENDING = impendingAbilities();

export default defineCard({
  name: "Overlord of the Boilerbilges",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Avatar", "Horror"],
  power: 5,
  toughness: 5,
  text: "Impending 4—{2}{R}{R} (If you cast this spell for its impending cost, it enters with four time counters and isn't a creature until the last is removed. At the beginning of your end step, remove a time counter from it.)\nWhenever this permanent enters or attacks, it deals 4 damage to any target.",
  impending: { count: 4, cost: "{2}{R}{R}" },
  triggered: [
    ...IMPENDING.triggered,
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [...TARGETS], effect: EFFECT, resolve: null, text: TRIGGER_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [...TARGETS], effect: EFFECT, resolve: null, text: TRIGGER_TEXT },
  ],
  static: [...IMPENDING.static],
});
