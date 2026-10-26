import { defineCard } from "../define.js";

// EDHREC rank 24466.
//
// Rulings:
//   When Shivan Wumpus enters, first the active player gets the option to sacrifice a land. If they decline, the next player in turn order gets the option. If a player elects to sacrifice a land, Shivan Wumpus is put on top of its owner's library, but then all remaining players still get the option. If all players decline, then nothing happens and Shivan Wumpus stays on the battlefield.

export default defineCard({
  name: "Shivan Wumpus",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, any player may sacrifice a land of their choice. If a player does, put this creature on top of its owner's library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ sacrifice: { type: "land", controlledBy: "you" }, text: "Sacrifice a land" }],
        ifDid: { kind: "put-on-library", target: "source", position: "top" },
      },
      resolve: null,
      text: "When this creature enters, any player may sacrifice a land of their choice. If a player does, put this creature on top of its owner's library.",
    },
  ],
});
