import { defineCard } from "../define.js";

const surge = (amount: number) =>
  ({
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount },
      { kind: "damage", amount, who: "each-player" },
    ],
  }) as const;

export default defineCard({
  name: "Canopy Surge",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nCanopy Surge deals 1 damage to each creature with flying and each player. If this spell was kicked, it deals 4 damage to each creature with flying and each player instead.",
  targets: [],
  effect: surge(1),
  kicker: { cost: "{2}", effect: surge(4) },
});
