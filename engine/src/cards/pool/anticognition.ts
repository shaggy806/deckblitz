import { defineCard } from "../define.js";

// The graveyard check is made as it resolves: then it's counter and scry 2,
// with no chance to pay; otherwise counter unless its controller pays {2}.

export default defineCard({
  name: "Anticognition",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or planeswalker spell unless its controller pays {2}. If an opponent has eight or more cards in their graveyard, instead counter that spell, then scry 2.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "conditional",
    condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
    then: {
      kind: "sequence",
      effects: [
        { kind: "counter", target: 0 },
        { kind: "scry", amount: 2 },
      ],
    },
    else: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
  },
});
