import { defineCard } from "../define.js";

// EDHREC rank 9728. The −9's count is read as it resolves, over every player
// still in the game (`greatestAmongPlayers`).

export default defineCard({
  name: "Sorin, Grim Nemesis",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sorin"],
  loyalty: 6,
  text: "+1: Reveal the top card of your library and put that card into your hand. Each opponent loses life equal to its mana value.\n−X: Sorin deals X damage to target creature or planeswalker and you gain X life.\n−9: Create a number of 1/1 black Vampire Knight creature tokens with lifelink equal to the highest life total among all players.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        reveal: true,
        then: { kind: "lose-life", who: "each-opponent", amount: { manaValueOf: 0 } },
      },
      resolve: null,
      text: "+1: Reveal the top card of your library and put that card into your hand. Each opponent loses life equal to its mana value.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "gain-life", amount: "x" },
        ],
      },
      resolve: null,
      text: "−X: Sorin deals X damage to target creature or planeswalker and you gain X life.",
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Vampire Knight Token",
        count: { greatestAmongPlayers: { lifeTotal: "each" } },
      },
      resolve: null,
      text: "−9: Create a number of 1/1 black Vampire Knight creature tokens with lifelink equal to the highest life total among all players.",
    },
  ],
});
