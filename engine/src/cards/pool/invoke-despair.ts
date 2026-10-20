import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 8948.
//
// Rulings:
//   [2022-02-18] The target opponent doesn't choose whether to sacrifice a creature or not,
//     although they do choose which creature they control to sacrifice.
//   [2022-02-18] When you repeat the process, you don't choose a new player. The same player
//     sacrifices each of the three permanents, if able.
//   [2022-02-18] You repeat the process for an enchantment and a planeswalker whether the target
//     opponent was able to sacrifice a creature or not.
//
// "If they can't" is asked after each edict by how many permanents this resolution has made
// them sacrifice in all — a running total, not a type filter, so an enchantment creature given
// up to the creature edict can't also answer the enchantment one. The tree below carries the
// count each branch expects: an edict that adds nothing to it is one they couldn't obey.

const PENALTY: readonly EffectSpec[] = [
  { kind: "lose-life", amount: 2, target: 0 },
  { kind: "draw", amount: 1 },
];

const EDICT_TYPES = ["creature", "enchantment", "planeswalker"] as const;

/** The edict for `EDICT_TYPES[step]` and every later one, `sacrificed` permanents having
 * been given up before it. */
function edicts(step: number, sacrificed: number): EffectSpec {
  const type = EDICT_TYPES[step];
  const rest = (n: number): readonly EffectSpec[] =>
    step + 1 < EDICT_TYPES.length ? [edicts(step + 1, n)] : [];
  return {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type }, count: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "sacrificed", atMost: sacrificed },
        then: { kind: "sequence", effects: [...PENALTY, ...rest(sacrificed)] },
        ...(rest(sacrificed + 1).length > 0
          ? { else: { kind: "sequence", effects: rest(sacrificed + 1) } }
          : {}),
      },
    ],
  };
}

export default defineCard({
  name: "Invoke Despair",
  manaCost: "{1}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent sacrifices a creature of their choice. If they can't, they lose 2 life and you draw a card. Then repeat this process for an enchantment and a planeswalker.",
  targets: ["opponent"],
  effect: edicts(0, 0),
});
