import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 27566. Cards with one name are alike, so whoever picks among
// them, the discard is the same; "if they can't" is nothing discarded this
// way.

export default defineCard({
  name: "Brain Pry",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Choose a nonland card name. Target player reveals their hand. That player discards a card with that name. If they can't, you draw a card.",
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    filter: { notTypes: ["land"] },
    then: {
      kind: "sequence",
      effects: [
        { kind: "discard-chosen", target: 0, filter: { hasName: CHOSEN_CARD_NAME } },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "discarded", atMost: 0 },
          then: { kind: "draw", amount: 1 },
        },
      ],
    },
  },
});
