import { defineCard } from "../define.js";

// EDHREC rank 27775. One trigger per simultaneous exile from your graveyard
// (delve's exile is one — the ruling), counting the cards; a card exiled
// instead of going to the graveyard never left it, so doesn't count.

export default defineCard({
  name: "Rakshasa Vizier",
  manaCost: "{2}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  text: "Whenever one or more cards are put into exile from your graveyard, put that many +1/+1 counters on this creature.",
  triggered: [
    {
      trigger: { on: "put-into-exile", who: "you", from: ["graveyard"] },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever one or more cards are put into exile from your graveyard, put that many +1/+1 counters on this creature.",
    },
  ],
});
