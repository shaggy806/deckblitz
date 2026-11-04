import { defineCard } from "../define.js";

// A private look, so one choice over the five rather than a question per card, which would name them
// to the table: the cards kept are the ones paid for, as many as the life allows (rule 119.4).

export default defineCard({
  name: "Moonlight Bargain",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Look at the top five cards of your library. For each card, put that card into your graveyard unless you pay 2 life. Then put the rest into your hand.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        min: 0,
        max: { lifePaymentsOf: 2 },
        destination: "hand",
        leftover: "graveyard",
      },
      { kind: "lose-life", amount: { product: [{ thisWay: "chosen" }, 2] }, who: "you" },
    ],
  },
});
