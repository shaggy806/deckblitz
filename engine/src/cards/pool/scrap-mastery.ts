import { defineCard } from "../define.js";

// EDHREC rank 6967.
//
// Rulings:
//   [2014-11-07] “Exiled this way” refers to the exile instruction that’s part of Scrap Mastery’s
//     effect. If the sacrificed artifacts are instead exiled because of a replacement effect,
//     those cards won’t be put onto the battlefield.
//
// Living Death's three instructions over artifacts: only what the first one
// exiled from the graveyards comes back (`put-exiled-this-way-onto-battlefield`
// leaves out a permanent exiled from the battlefield — the ruling).
const TEXT =
  "Each player exiles all artifact cards from their graveyard, then sacrifices all artifacts they control, then puts all cards they exiled this way onto the battlefield.";

export default defineCard({
  name: "Scrap Mastery",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "each-player", filter: { type: "artifact" } },
      { kind: "sacrifice-all", who: "each-player", filter: { type: "artifact" } },
      { kind: "put-exiled-this-way-onto-battlefield" },
    ],
  },
});
