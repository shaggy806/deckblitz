import { defineCard } from "../define.js";

const ENTER_TEXT =
  'When this creature enters, create a Lander token. At the beginning of the end step on your next turn, sacrifice that token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")';

export default defineCard({
  name: "Kav Landseeker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Lander Token", count: 1 },
          {
            kind: "delayed-trigger",
            at: { step: "end", whose: "you", which: "next-turn" },
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice that token.",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
