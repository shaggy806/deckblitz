import { defineCard } from "../define.js";

// EDHREC rank 4371. The graveyard is read as it resolves (Flow State itself is
// still on the stack).

export default defineCard({
  name: "Flow State",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. If there is an instant card and a sorcery card in your graveyard, instead put two of them into your hand and the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "instant" } },
        { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "sorcery" } },
      ],
    },
    then: { kind: "look-and-choose", zone: "library", count: 3, min: 2, max: 2, destination: "hand", leftover: "bottom-any-order" },
    else: { kind: "look-and-choose", zone: "library", count: 3, min: 1, max: 1, destination: "hand", leftover: "bottom-any-order" },
  },
});
