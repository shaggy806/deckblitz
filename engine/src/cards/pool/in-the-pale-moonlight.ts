import { defineCard } from "../define.js";

// EDHREC rank 31192.

const I_TEXT = "I — Each opponent sacrifices a nontoken creature of their choice.";
const II_TEXT = "II — Investigate.";
const III_TEXT =
  "III — You may sacrifice an artifact or creature. If you do, create two 2/2 black Romulan creature tokens.";

export default defineCard({
  name: "In the Pale Moonlight",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { token: false, type: "creature" }, count: 1 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { typesAnyOf: ["artifact", "creature"] }, text: "Sacrifice an artifact or creature" }],
        ifDid: { kind: "create-token", token: "Romulan Token", count: 2 },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
