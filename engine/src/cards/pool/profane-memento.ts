import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 8621.
//
// Tokens aren't cards, so a token dying never fires it; whose graveyard is
// the card's owner's, so an opponent's creature you control dying does (the
// rulings).

const TEXT = "Whenever a creature card is put into an opponent's graveyard from anywhere, you gain 1 life.";

export default defineCard({
  name: "Profane Memento",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
