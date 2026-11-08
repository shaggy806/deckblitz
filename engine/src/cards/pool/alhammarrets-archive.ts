import { defineCard } from "../define.js";

const LIFE = "If you would gain life, you gain twice that much life instead.";
const DRAW = "If you would draw a card except the first one you draw in each of your draw steps, draw two cards instead.";

export default defineCard({
  name: "Alhammarret's Archive",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${LIFE}\n${DRAW}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", instead: { modify: { times: 2 } } },
      text: LIFE,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-draw", who: "you", instead: { modify: { set: 2 } }, exceptFirstInDrawStep: true },
      text: DRAW,
    },
  ],
});
