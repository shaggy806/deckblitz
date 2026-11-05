import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 12625.
//
// The life gained is that count too, whatever damage was actually dealt (the
// ruling). Every card that player owns in exile counts, face-down ones included:
// an owner-only filter can read them.

const OWNED_IN_EXILE: EffectAmount = { aggregate: "count", filter: { ownedBy: "you" }, in: "exile", forTarget: 0 };

export default defineCard({
  name: "Kaya, Orzhov Usurper",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaya"],
  loyalty: 3,
  text: "+1: Exile up to two target cards from a single graveyard. You gain 2 life if at least one creature card was exiled this way.\n−1: Exile target nonland permanent with mana value 1 or less.\n−5: Kaya deals damage to target player equal to the number of cards that player owns in exile and you gain that much life.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2, sameController: true }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: { kind: "gain-life", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: "+1: Exile up to two target cards from a single graveyard. You gain 2 life if at least one creature card was exiled this way.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { notTypes: ["land"], manaValue: { op: "lte", n: 1 } } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "−1: Exile target nonland permanent with mana value 1 or less.",
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: OWNED_IN_EXILE, target: 0 },
          { kind: "gain-life", amount: OWNED_IN_EXILE },
        ],
      },
      resolve: null,
      text: "−5: Kaya deals damage to target player equal to the number of cards that player owns in exile and you gain that much life.",
    },
  ],
});
