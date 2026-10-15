import { defineCard } from "../define.js";

// EDHREC rank 19599.
// Makes Treasure → use "Treasure Token".
//
// Beetle-Headed Merchants' optional sacrifice on attack ("another" — never
// this creature), surveil 2 if it's paid.

const ETB_TEXT = "When this creature enters, you lose 1 life and create a Treasure token.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature or artifact. If you do, surveil 2.";

export default defineCard({
  name: "Namazu Trader",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fish", "Citizen"],
  power: 3,
  toughness: 4,
  text: `${ETB_TEXT}\n${ATTACK_TEXT} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "artifact"] },
            exceptSource: true,
            text: "Sacrifice another creature or artifact",
          },
        ],
        ifDid: { kind: "surveil", amount: 2 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
