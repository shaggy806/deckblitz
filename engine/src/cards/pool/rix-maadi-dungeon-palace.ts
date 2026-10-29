import { defineCard } from "../define.js";

// EDHREC rank 10041.
//
// Each player chooses a card in turn order from the active player, face down,
// then all are discarded at once (the ruling; rule 101.4).
export default defineCard({
  name: "Rix Maadi, Dungeon Palace",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}{B}{R}, {T}: Each player discards a card. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}{B}{R}", tap: true },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: "{1}{B}{R}, {T}: Each player discards a card. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
