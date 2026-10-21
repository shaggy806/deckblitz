import { defineCard } from "../define.js";

export default defineCard({
  name: "Board the Weatherlight",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library. You may reveal a historic card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. (Artifacts, legendaries, and Sagas are historic.)",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
    destination: "hand",
    leftover: "bottom-random",
  },
});
