import { defineCard } from "../define.js";

// EDHREC rank 17313. Future Sight.
//
// Slaughter Pact's shape: the delayed trigger is set up as the spell
// resolves, and never if it's countered (the ruling). Red by its colour
// indicator.

const TOKEN_TEXT = "Create a 4/4 red Giant creature token.";
const UPKEEP = "At the beginning of your next upkeep, pay {4}{R}. If you don't, you lose the game.";

export default defineCard({
  name: "Pact of the Titan",
  manaCost: "{0}",
  colors: ["R"],
  types: ["instant"],
  text: `${TOKEN_TEXT}\n${UPKEEP}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Red Giant Token 4/4", count: 1 },
      {
        kind: "delayed-trigger",
        at: "your-next-upkeep",
        effect: {
          kind: "unless",
          chooser: "you",
          options: [{ pay: "{4}{R}", text: "Pay {4}{R}." }],
          otherwise: { kind: "lose-game" },
        },
        text: UPKEEP,
      },
    ],
  },
});
