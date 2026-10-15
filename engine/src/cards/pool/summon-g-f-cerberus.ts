import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 7596. A Saga creature (Summon: G.F. Ifrit's shape).
//
// Rulings:
//   [2025-06-13] After Summon: G.F. Cerberus's second or third chapter ability resolves, the next
//     instant or sorcery spell you cast that turn will be copied whether or not it has targets.
//   [2025-06-13] The copy is created on the stack, so it's not "cast." Abilities that trigger when
//     a player casts a spell won't trigger.
//
// - II and III are Rimefire Torque's delayed copy (the chapter names "Double"
//   and "Triple" are ability words); III's is `count: 2`, each copy asked
//   about new targets in turn.
const ONE = "I — Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";
const TWO =
  "II — Double — When you next cast an instant or sorcery spell this turn, copy it. You may choose new targets for the copy.";
const THREE =
  "III — Triple — When you next cast an instant or sorcery spell this turn, copy it twice. You may choose new targets for the copies.";

const nextSpellCopies = (count: number, text: string): EffectSpec => ({
  kind: "delayed-trigger",
  at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
  effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, ...(count === 1 ? {} : { count }) },
  text,
});

export default defineCard({
  name: "Summon: G.F. Cerberus",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Dog"],
  power: 3,
  toughness: 3,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE}\n${TWO}\n${THREE}`,
  chapters: [
    { at: [1], targets: [], effect: { kind: "surveil", amount: 1 }, resolve: null, text: ONE },
    {
      at: [2],
      targets: [],
      effect: nextSpellCopies(
        1,
        "When you next cast an instant or sorcery spell this turn, copy it. You may choose new targets for the copy.",
      ),
      resolve: null,
      text: TWO,
    },
    {
      at: [3],
      targets: [],
      effect: nextSpellCopies(
        2,
        "When you next cast an instant or sorcery spell this turn, copy it twice. You may choose new targets for the copies.",
      ),
      resolve: null,
      text: THREE,
    },
  ],
});
