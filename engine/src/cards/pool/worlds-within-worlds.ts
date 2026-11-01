import { defineCard } from "../define.js";

// Marvel Super Heroes (MSH). "Each player may put any number of creature
// cards from their hand onto the battlefield" is asked of each player in
// turn order and then done at once (rule 101.4): the cards each chooses wait
// hidden in hand until the last has chosen, and enter together. "All cards
// exiled this way" are the creatures exiled — tokens have ceased to exist.

const TEXT =
  "Exile all creatures. Each player may put any number of creature cards from their hand onto the battlefield. Then put all cards exiled this way into their owners' hands. Exile Worlds Within Worlds.";

export default defineCard({
  name: "Worlds Within Worlds",
  manaCost: "{5}{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  text: TEXT,
  exileOnResolve: true,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature" } },
      {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Put creature cards from your hand onto the battlefield?",
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: 99,
          filter: { type: "creature" },
          destination: "battlefield",
          leftover: "stay",
        },
      },
      { kind: "move-exiled-this-way", to: "hand" },
    ],
  },
});
