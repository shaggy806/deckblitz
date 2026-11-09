import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 2842.
//
// Rulings:
//   [2021-04-16] If another effect causes one of the returned permanents to become a creature and
//     sets its power and toughness as it does so, that creature will have that power and
//     toughness; it won't be 4/4.
//   [2021-04-16] If a card in a player's graveyard has {X} in its mana cost, that X is considered
//     to be 0.
//   [2021-04-16] An artifact creature or enchantment creature returned this way will be a 4/4
//     creature.
//   [2021-04-16] If X is 6 or more, the artifacts and/or enchantments enter the battlefield as 4/4
//     creatures. They don't enter as noncreature permanents and then become creatures.
//
// The cards return together (`simultaneous`); with X 6 or more each is a 4/4
// creature in addition to its other types as it enters (`enterAs`, rule
// 614.12), base 4/4 in layer 7b so other P/T changes apply over it.
const put = (enterAs?: true): EffectSpec => ({
  kind: "for-each-target",
  from: 0,
  simultaneous: true,
  effect: {
    kind: "put-onto-battlefield",
    target: 0,
    ...(enterAs ? { enterAs: { addTypes: ["creature"], power: 4, toughness: 4 } } : {}),
  },
});

export default defineCard({
  name: "Dance of the Manse",
  manaCost: "{X}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Return up to X target artifact and/or non-Aura enchantment cards each with mana value X or less from your graveyard to the battlefield. If X is 6 or more, those permanents are 4/4 creatures in addition to their other types.",
  targets: [
    {
      kind: "any-number",
      max: "x",
      of: {
        kind: "card-in-graveyard",
        whose: "you",
        filter: {
          anyOf: [{ type: "artifact" }, { type: "enchantment", notSubtypes: ["Aura"] }],
          manaValue: { op: "lte", n: "x" },
        },
      },
    },
  ],
  effect: {
    kind: "conditional",
    condition: { kind: "x", compare: { op: "gte", n: 6 } },
    then: put(true),
    else: put(),
  },
});
