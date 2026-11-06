import { defineCard } from "../define.js";

// EDHREC rank 26627.

const ENTER_TEXT = "When Khan enters, you may sacrifice another creature or artifact. If you do, draw two cards.";

export default defineCard({
  name: "Khan, Vengeful Heart",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 5,
  toughness: 3,
  text: `${ENTER_TEXT}\nYou may cast this card from exile.`,
  castSelfFromExile: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
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
        ifDid: { kind: "draw", amount: 2 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
