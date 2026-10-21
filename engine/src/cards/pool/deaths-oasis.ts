import { defineCard } from "../define.js";

// EDHREC rank 15603. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Because the triggered ability doesn't target the creature card in your
//     graveyard, you may choose one of the two cards you put there from your library.
//   [2020-04-17] Use the mana value of the creature as it last existed on the battlefield and the
//     mana value of the creature card as it exists in your graveyard to determine which cards may
//     be returned to your hand. This may result in a creature's death bringing itself back to your
//     hand; perhaps it was one card of a merged creature, or it had become a copy of a more
//     expensive creature.
//   [2020-04-17] If Death's Oasis becomes a creature, activating its last ability will cause its
//     first ability to trigger.
//   [2020-04-17] If a creature on the battlefield or a card in your graveyard has {X} in its mana
//     cost, X is considered to be 0.

// The return is untargeted and chosen as the trigger resolves, after the mill
// (Carrion Cruiser's shape), so a milled card can be the one. "Lesser mana
// value than the creature that died" compares against the trigger object,
// read as it last existed on the battlefield. "Return a creature card" isn't
// optional: one is returned whenever one qualifies.
const DIES_TEXT =
  "Whenever a nontoken creature you control dies, mill two cards. Then return a creature card with lesser mana value than the creature that died from your graveyard to your hand.";
const LIFE_TEXT =
  "{1}, Sacrifice this enchantment: You gain life equal to the greatest mana value among creatures you control.";

export default defineCard({
  name: "Death's Oasis",
  manaCost: "{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["enchantment"],
  text: `${DIES_TEXT}\n${LIFE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { aggregate: "max", of: "mana-value", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: {
              type: "creature",
              manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } },
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
