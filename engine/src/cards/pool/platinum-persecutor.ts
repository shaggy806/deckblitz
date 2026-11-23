import { defineCard } from "../define.js";

// Playtest card. Its own static stops anyone winning while it's on the
// battlefield, so the upkeep ability sacrifices it first and the win comes
// after. "Each player has an empty library" is "no player still in the game
// has a card in theirs", read as it triggers and again as it resolves.

const LOCK_TEXT = "Players can't lose the game or win the game.";
const WIN_TEXT =
  "At the beginning of your upkeep, if each player has an empty library, sacrifice Platinum Persecutor and you win the game.";

export default defineCard({
  name: "Platinum Persecutor",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Angel", "Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${LOCK_TEXT}\n${WIN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "lose-game", who: "each-player" },
        { act: "win-game", who: "each-player" },
      ],
      text: LOCK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "not", of: { kind: "library-size", who: "any-player", atLeast: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice-source" }, { kind: "win-game" }],
      },
      resolve: null,
      text: WIN_TEXT,
    },
  ],
});
