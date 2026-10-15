import { defineCard } from "../define.js";

// EDHREC rank 15461.

const ENTER_TEXT =
  'When this creature enters, create a Lander token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")';
const DRAW_TEXT = "{8}: Draw two cards and create a 2/2 colorless Robot artifact creature token.";

export default defineCard({
  name: "Biomechan Engineer",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Insect", "Artificer"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Lander token.",
    },
  ],
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "create-token", token: "Robot Token", count: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
