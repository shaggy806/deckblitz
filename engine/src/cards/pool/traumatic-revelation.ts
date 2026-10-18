import { defineCard } from "../define.js";

// EDHREC rank 19587. March of the Machine.
//
// "You may choose" (`optional`): a card is discarded only when one was
// chosen, so "if you don't" is nothing discarded this way — a hand with no
// creature or battle card in it included.

export default defineCard({
  name: "Traumatic Revelation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: 'Target opponent reveals their hand. You may choose a creature or battle card from it. If you do, that player discards that card. If you don\'t, incubate 3. (Create an Incubator token with three +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)',
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["creature", "battle"] }, optional: true },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "this-way", what: "discarded", atLeast: 1 } },
        then: { kind: "incubate", amount: 3 },
      },
    ],
  },
});
