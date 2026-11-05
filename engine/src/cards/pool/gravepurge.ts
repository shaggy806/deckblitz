import { defineCard } from "../define.js";

// EDHREC rank 7454.

export default defineCard({
  name: "Gravepurge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put any number of target creature cards from your graveyard on top of your library.\nDraw a card.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
      { kind: "draw", amount: 1 },
    ],
  },
});
