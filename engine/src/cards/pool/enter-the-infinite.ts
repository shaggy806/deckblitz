import { defineCard } from "../define.js";

export default defineCard({
  name: "Enter the Infinite",
  manaCost: "{8}{U}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw cards equal to the number of cards in your library, then put a card from your hand on top of your library. You have no maximum hand size until your next turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { librarySize: "you" } },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 1,
        max: 1,
        destination: "library-top",
        leftover: "stay",
      },
      { kind: "player-effect", duration: "until-your-next-turn", noMaxHandSize: "you" },
    ],
  },
});
