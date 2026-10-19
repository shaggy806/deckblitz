import { defineCard } from "../define.js";

// Ruling (2022-09-09): if the target is illegal as it resolves, the spell does
// nothing — no life gained or lost — and goes to the graveyard, not exile (a
// fizzled spell never reaches `exileOnResolve`).
export default defineCard({
  name: "Sheoldred's Restoration",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Kicker {2}{W} (You may pay an additional {2}{W} as you cast this spell.)\n" +
    "Return target creature card from your graveyard to the battlefield. If this spell was kicked, you gain life equal to that card's mana value. Otherwise, you lose that much life.\n" +
    "Exile Sheoldred's Restoration.",
  exileOnResolve: true,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "lose-life", amount: { manaValueOf: 0 } },
    ],
  },
  kicker: {
    cost: "{2}{W}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "put-onto-battlefield", target: 0 },
        { kind: "gain-life", amount: { manaValueOf: 0 } },
      ],
    },
  },
});
