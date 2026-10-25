import { defineCard } from "../define.js";

// EDHREC rank 12888. Everyone sacrifices at once (`sacrifice-all`); then each
// player may search for up to as many basic lands as lands they sacrificed —
// "you" in an `each-player-may` is the player asked, and the `sacrificed`
// this-way entries are counted by who sacrificed them. A player who
// sacrificed no land doesn't search (the conditional), so doesn't shuffle.

export default defineCard({
  name: "Wave of Vitriol",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player sacrifices all artifacts, enchantments, and nonbasic lands they control. For each land sacrificed this way, its controller may search their library for a basic land card and put it onto the battlefield tapped. Then each player who searched their library this way shuffles.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sacrifice-all",
        who: "each-player",
        filter: {
          anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "land", notSupertype: "basic" }],
        },
      },
      {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Search your library for a basic land card for each land you sacrificed?",
        effect: {
          kind: "conditional",
          condition: { kind: "this-way", what: "sacrificed", who: "you", filter: { type: "land" }, atLeast: 1 },
          then: {
            kind: "search-library",
            filter: { type: "land", supertype: "basic" },
            destination: "battlefield",
            enterTapped: true,
            min: 0,
            max: { thisWay: "sacrificed", who: "you", filter: { type: "land" } },
          },
        },
      },
    ],
  },
});
