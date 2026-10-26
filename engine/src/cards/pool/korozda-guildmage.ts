import { defineCard } from "../define.js";

// EDHREC rank 13492.
//
// Rulings:
//   [2012-10-01] Use the sacrificed creature's toughness when it was last on the battlefield to
//     determine the value of X.
//
// `toughnessOf: "sacrificed"` reads the sacrificed creature as it last existed (Ghoulcaller
// Gisa's `powerOf` shape).

export default defineCard({
  name: "Korozda Guildmage",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{1}{B}{G}: Target creature gets +1/+1 and gains intimidate until end of turn. (It can't be blocked except by artifact creatures and/or creatures that share a color with it.)\n{2}{B}{G}, Sacrifice a nontoken creature: Create X 1/1 green Saproling creature tokens, where X is the sacrificed creature's toughness.",
  activated: [
    {
      cost: { mana: "{1}{B}{G}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "intimidate", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{1}{B}{G}: Target creature gets +1/+1 and gains intimidate until end of turn.",
    },
    {
      cost: {
        mana: "{2}{B}{G}",
        tap: false,
        sacrifice: { filter: { token: false, type: "creature" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: "{2}{B}{G}, Sacrifice a nontoken creature: Create X 1/1 green Saproling creature tokens, where X is the sacrificed creature's toughness.",
    },
  ],
});
