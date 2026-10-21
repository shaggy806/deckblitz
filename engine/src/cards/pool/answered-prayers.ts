import { defineCard } from "../define.js";

// EDHREC rank 16249.
//
// Rulings:
//   [2019-06-14] If Answered Prayers becomes a creature but you haven't controlled it continuously
//     since your most recent turn began, you won't be able to attack with it.
//   [2019-06-14] Once Answered Prayers becomes a creature, you'll still gain life whenever a
//     creature enters the battlefield under your control.
// "If this enchantment isn't a creature" is read as the ability resolves —
// part of its effect, not an intervening if.

const TEXT =
  "Whenever a creature you control enters, you gain 1 life. If this enchantment isn't a creature, it becomes a 3/3 Angel creature with flying in addition to its other types until end of turn.";

export default defineCard({
  name: "Answered Prayers",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { notTypes: ["creature"] } },
            then: {
              kind: "animate",
              target: "source",
              power: 3,
              toughness: 3,
              addTypes: ["creature"],
              addSubtypes: ["Angel"],
              keywords: ["flying"],
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
