import { defineCard } from "../define.js";
import { impendingAbilities } from "../helpers.js";

// EDHREC rank 1737.
// Makes Everywhere → new token "Everywhere Token" (scaffolded).
//
// Rulings:
//   [2024-09-20] "Impending N–[cost]" is a keyword that represents multiple abilities. The
//     official rules are as follows: (a) You may choose to pay [cost] rather than pay this spell's
//     mana cost. (b) If you chose to pay this spell's impending cost, it enters the battlefield
//     with N time counters on it. (c) As long as this permanent has a time counter on it, if it
//     was cast for its impending cost, it's not a creature. (d) At the beginning of your end step,
//     if this permanent was cast for its impending cost, remove a time counter from it.
//   [2024-09-20] If you choose to pay the impending cost rather than the mana cost, you're still
//     casting the spell. It goes on the stack and can be responded to, countered, and so on.
//   [2024-09-20] If you choose to pay the impending cost of a creature spell, it's still a
//     creature spell on the stack. You can cast that spell for its impending cost only when you
//     could normally cast that creature spell. Most of the time, this means during your main phase
//     when the stack is empty.
//   [2024-09-20] The Everywhere token created by Overlord of the Hauntwoods's last ability has the
//     land types Plains, Island, Swamp, Mountain, and Forest. It also has the mana ability of each
//     basic land type (for example, Forests have "{T}: Add {G}"). It does not have the basic
//     supertype.
//   [2024-09-20] If an object enters as a copy of a permanent that was cast with its impending
//     cost, it won't enter with time counters, and it will be a creature.

const TRIGGER_TEXT = "Whenever this permanent enters or attacks, create a tapped colorless land token named Everywhere that is every basic land type.";
const TARGETS = [] as const;
const EFFECT = { kind: "create-token", token: "Everywhere Token", count: 1, tapped: true } as const;
const IMPENDING = impendingAbilities();

export default defineCard({
  name: "Overlord of the Hauntwoods",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Avatar", "Horror"],
  power: 6,
  toughness: 5,
  text: "Impending 4—{1}{G}{G} (If you cast this spell for its impending cost, it enters with four time counters and isn't a creature until the last is removed. At the beginning of your end step, remove a time counter from it.)\nWhenever this permanent enters or attacks, create a tapped colorless land token named Everywhere that is every basic land type.",
  impending: { count: 4, cost: "{1}{G}{G}" },
  triggered: [
    ...IMPENDING.triggered,
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [...TARGETS], effect: EFFECT, resolve: null, text: TRIGGER_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [...TARGETS], effect: EFFECT, resolve: null, text: TRIGGER_TEXT },
  ],
  static: [...IMPENDING.static],
});
