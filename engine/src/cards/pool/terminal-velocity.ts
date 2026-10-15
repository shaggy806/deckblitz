import { defineCard } from "../define.js";

// EDHREC rank 15596.
//
// Rulings:
//   [2025-07-25] If a permanent has {X} in its mana cost, X is 0 for the purpose of determining
//     its mana value.
//   [2025-07-25] Use the permanent's mana value as it last existed on the battlefield to determine
//     how much damage the triggered ability deals.
//
// Sneak Attack's shape. What the permanent gains has no duration, so it lasts
// as long as the permanent does: haste and two triggered abilities riding on
// its own modifiers (Feign Death's `grant-triggered`). The leaves ability is
// the permanent's own, so "it deals damage" is from it, its mana value read
// as it last existed; "your end step" is its controller's.

const LEAVES_TEXT = "When this permanent leaves the battlefield, it deals damage equal to its mana value to each creature.";
const END_TEXT = "At the beginning of your end step, sacrifice this permanent.";
const TEXT =
  'You may put an artifact or creature card from your hand onto the battlefield. That permanent gains haste, "When this permanent leaves the battlefield, it deals damage equal to its mana value to each creature," and "At the beginning of your end step, sacrifice this permanent."';

export default defineCard({
  name: "Terminal Velocity",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "look-and-choose",
    zone: "hand",
    min: 0,
    max: 1,
    destination: "battlefield",
    leftover: "stay",
    filter: { typesAnyOf: ["artifact", "creature"] },
    then: {
      kind: "sequence",
      effects: [
        { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
        {
          kind: "grant-triggered",
          target: 0,
          duration: "permanent",
          ability: {
            trigger: { on: "leaves-battlefield", who: "self" },
            targets: [],
            effect: { kind: "damage-all", filter: { type: "creature" }, amount: { manaValueOf: "source" } },
            resolve: null,
            text: LEAVES_TEXT,
          },
        },
        {
          kind: "grant-triggered",
          target: 0,
          duration: "permanent",
          ability: {
            trigger: { on: "step-begins", step: "end", who: "you" },
            targets: [],
            effect: { kind: "sacrifice-source" },
            resolve: null,
            text: END_TEXT,
          },
        },
      ],
    },
  },
});
