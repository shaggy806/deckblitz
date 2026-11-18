import { defineCard } from "../define.js";

// EDHREC rank 15123.
//
// One reveal, then each opponent in turn from the next one (`eachChooses`),
// each choosing from what the ones before left — so all different (rule
// 101.4). With fewer nonland cards than opponents, every one of them is
// chosen (the ruling); the chosen cards go into your hand together.

const TEXT =
  "Reveal the top ten cards of your library. Starting with the next opponent in turn order, each opponent chooses a different nonland card from among them. Put the chosen cards into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Manifold Insights",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 10,
    reveal: true,
    eachChooses: "each-opponent",
    min: 1,
    max: 1,
    filter: { notTypes: ["land"] },
    destination: "hand",
    leftover: "bottom-random",
  },
});
