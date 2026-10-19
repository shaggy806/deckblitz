import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 13423.
//
// Kicked, the spell has a second target — "another target permanent card",
// any slot-0 card excluded — so it can't be cast kicked without both a
// creature card and another permanent card in your graveyard (the ruling);
// unkicked it has only the one target.
const CREATURE_CARD = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;
const PERMANENT_CARD = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { notTypes: ["instant", "sorcery"] },
} as const;

export default defineCard({
  name: "Urborg Repossession",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {1}{G} (You may pay an additional {1}{G} as you cast this spell.)\nReturn target creature card from your graveyard to your hand. You gain 2 life. If this spell was kicked, return another target permanent card from your graveyard to your hand.",
  targets: [CREATURE_CARD],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "gain-life", amount: 2 },
    ],
  },
  kicker: {
    cost: "{1}{G}",
    targets: [CREATURE_CARD, { kind: "other", of: PERMANENT_CARD, than: { slot: 0 } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0, from: "graveyard" },
        { kind: "gain-life", amount: 2 },
        { kind: "return-to-hand", target: 1, from: "graveyard" },
      ],
    },
  },
});
