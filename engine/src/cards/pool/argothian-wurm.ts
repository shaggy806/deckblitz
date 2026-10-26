import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 21585. Each player is asked in turn from the
// active player (the ruling), knowing who sacrificed before them, and each may
// still sacrifice once one has; if any did, the Wurm goes on top of its
// owner's library — only the Wurm that entered (rule 400.7), so a second
// player's sacrifice moves nothing more.

const TEXT =
  "When this creature enters, any player may sacrifice a land of their choice. If a player does, put this creature on top of its owner's library.";

export default defineCard({
  name: "Argothian Wurm",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
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
      text: TEXT,
    },
  ],
});
