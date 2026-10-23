import { defineCard } from "../define.js";

export default defineCard({
  name: "Saheeli's Directive",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Improvise (Each artifact you tap after you're done activating mana abilities pays for {1}.)\nReveal the top X cards of your library. You may put any number of artifact cards with mana value X or less from among them onto the battlefield. Then put all cards revealed this way that weren't put onto the battlefield into your graveyard.",
  // Improvise (rule 702.126a): artifacts tapped as it's cast pay its generic
  // mana, X included once X is chosen (the ruling).
  improvise: true,
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: "x",
    reveal: true,
    min: 0,
    max: "x",
    destination: "battlefield",
    leftover: "graveyard",
    filter: { type: "artifact", manaValue: { op: "lte", n: { amount: "x" } } },
  },
});
