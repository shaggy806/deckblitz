import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, look at the top six cards of your library. You may reveal a land or legendary Turtle card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Definitely Not a Turtle",
  manaCost: "{3}",
  colors: [],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 3,
  toughness: 2,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ type: "land" }, { supertype: "legendary", subtype: "Turtle" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
