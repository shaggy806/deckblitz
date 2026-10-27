import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 14578. Earthquake's shape, 1 damage — or 4 when
// kicked (the kicked variant replaces the effect).

const breath = (amount: number): EffectSpec => ({
  kind: "sequence",
  simultaneous: true,
  effects: [
    { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount },
    { kind: "damage", amount, who: "each-player" },
  ],
});

export default defineCard({
  name: "Breath of Darigaaz",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nBreath of Darigaaz deals 1 damage to each creature without flying and each player. If this spell was kicked, it deals 4 damage to each creature without flying and each player instead.",
  targets: [],
  effect: breath(1),
  kicker: { cost: "{2}", effect: breath(4) },
});
