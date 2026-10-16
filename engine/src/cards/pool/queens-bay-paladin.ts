import { defineCard } from "../define.js";

// EDHREC rank 14144. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would be put into a graveyard from the battlefield, exile it
//     instead.
//
// Yuna, Hope of Spira's "up to one target … with a finality counter on it"
// and Sister Hospitaller's "life equal to its mana value" (`manaValueOf`, the
// card as it last existed); with no target chosen there's no card and no
// life lost. "Enters or attacks" is two triggers.

const TEXT =
  "Whenever this creature enters or attacks, return up to one target Vampire card from your graveyard to the battlefield with a finality counter on it. You lose life equal to its mana value.";

const REANIMATE = {
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Vampire" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
      { kind: "lose-life", amount: { manaValueOf: 0 } },
    ],
  },
  resolve: null,
  text: TEXT,
} as const;

export default defineCard({
  name: "Queen's Bay Paladin",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 5,
  toughness: 4,
  text: `${TEXT} (If a creature with a finality counter on it would die, exile it instead.)`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...REANIMATE },
    { trigger: { on: "attacks", who: "self" }, ...REANIMATE },
  ],
});
