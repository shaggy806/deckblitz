import { defineCard } from "../define.js";

// "It" is the permanent this resolution manifested (`thisWay:
// "put-onto-battlefield"`, as Cryptic Coat's attach reads it).

export default defineCard({
  name: "Fierce Invocation",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Manifest the top card of your library, then put two +1/+1 counters on it. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "manifest", who: "you" },
      {
        kind: "add-counter-all",
        filter: { thisWay: "put-onto-battlefield" },
        counter: "+1/+1",
        amount: 2,
      },
    ],
  },
});
