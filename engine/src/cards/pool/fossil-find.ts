import { defineCard } from "../define.js";

// Haunted Fengraf's random return, then `reorder-graveyard`: the whole pile arranged with
// `choose-from-zone`'s `order`, while this spell is still on the stack, so it lands on top
// (rule 608.2m). Asked only in a game with a card that reads a graveyard's order.

export default defineCard({
  name: "Fossil Find",
  manaCost: "{R/G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Return a card at random from your graveyard to your hand, then reorder your graveyard as you choose.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-random-card",
        zone: "graveyard",
        then: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      { kind: "reorder-graveyard" },
    ],
  },
});
