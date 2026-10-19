import { defineCard } from "../define.js";

// EDHREC rank 8374.
//
// Rulings:
//   [2022-10-14] Although all the cards in The Brothers’ War that create Powerstone tokens create
//     a tapped Powerstone token, entering the battlefield tapped isn’t part of the token’s
//     definition. Notably, if you create a token that is a copy of a Powerstone token, the token
//     copy won’t enter the battlefield tapped.
//
// "Then all creatures get -1/-1 for each artifact you control": counted once,
// after the new Powerstones are on the battlefield, as the step applies; the
// creatures it affects are fixed then too (rule 611.2c).

const EACH_ARTIFACT = { countOf: { type: "artifact", controlledBy: "you" } } as const;

export default defineCard({
  name: "Terisiare's Devastation",
  manaCost: "{X}{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You lose X life and create X tapped Powerstone tokens. Then all creatures get -1/-1 until end of turn for each artifact you control. (The tokens are artifacts with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: "x" },
      { kind: "create-token", token: "Powerstone Token", count: "x", tapped: true },
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: { product: [EACH_ARTIFACT, -1] },
        toughness: { product: [EACH_ARTIFACT, -1] },
        duration: "end-of-turn",
      },
    ],
  },
});
