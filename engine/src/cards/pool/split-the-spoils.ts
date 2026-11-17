import { defineCard } from "../define.js";

// You exile the targets and separate them there (rule 700.3); the opponent
// you then choose picks the pile for your hand, and the other goes to your
// graveyard — all of them, when the pile chosen is empty (the rulings).

const TEXT =
  "Exile up to five target permanent cards from your graveyard and separate them into two piles. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard. (Piles can be empty.)";

export default defineCard({
  name: "Split the Spoils",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } },
      max: 5,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
      {
        kind: "separate-into-piles",
        objects: { thisWay: "exiled" },
        chooser: "an-opponent",
        chosen: "hand",
        rest: "graveyard",
      },
    ],
  },
});
