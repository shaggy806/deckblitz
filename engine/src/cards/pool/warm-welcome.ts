import { defineCard } from "../define.js";

export default defineCard({
  name: "Warm Welcome",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. Create a 1/1 green and white Citizen creature token.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      { kind: "create-token", token: "Citizen Token", count: 1 },
    ],
  },
});
