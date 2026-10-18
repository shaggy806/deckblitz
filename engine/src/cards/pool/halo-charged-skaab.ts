import { defineCard } from "../define.js";

// EDHREC rank 21548. March of the Machine.
//
// The card put on top isn't targeted: it's chosen as the ability resolves,
// after the mill, so it may be one just milled (the ruling).

const TEXT =
  "When this creature enters, each player mills two cards. Then you may put an instant, sorcery, or battle card from your graveyard on top of your library.";

export default defineCard({
  name: "Halo-Charged Skaab",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (To mill two cards, a player puts the top two cards of their library into their graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "library-top",
            leftover: "stay",
            filter: { typesAnyOf: ["instant", "sorcery", "battle"] },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
