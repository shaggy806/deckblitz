import { defineCard } from "../define.js";

// EDHREC rank 18627. X is counted as it resolves (rule 608.2h): the players
// being attacked then, not their planeswalkers or battles (802.4), so outside
// combat it's 0. The creatures that get it are the attacking ones then; one
// that starts attacking later doesn't (611.2c).
const TEXT =
  "Attacking creatures get +X/+0 until end of turn, where X is the number of players being attacked.\nDraw a card.";

export default defineCard({
  name: "Pack Attack",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: { countPlayers: "players-being-attacked" },
        toughness: 0,
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
