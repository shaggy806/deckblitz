import { defineCard } from "../define.js";

// EDHREC rank 4367. "Unless you waterbend {2}": an `unless` option whose
// `pay` is a waterbend cost (rule 701.67a), each {1} payable by tapping an
// untapped artifact or creature.

export default defineCard({
  name: "Waterbending Lesson",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Draw three cards. Then discard a card unless you waterbend {2}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}", waterbend: true, text: "Waterbend {2}" }],
        otherwise: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
});
