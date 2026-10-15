import { defineCard } from "../define.js";

// EDHREC rank 16036.


// Vivien Reid's +1 with a wider filter: a Mutant, Ninja or Turtle card (a
// kindred card or a changeling counts — `subtype` reads through them) or a
// land card.
export default defineCard({
  name: "Cowabunga!",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. You may reveal a Mutant, Ninja, Turtle, or land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { anyOf: [{ subtype: "Mutant" }, { subtype: "Ninja" }, { subtype: "Turtle" }, { type: "land" }] },
    destination: "hand",
    leftover: "bottom-random",
  },
});
