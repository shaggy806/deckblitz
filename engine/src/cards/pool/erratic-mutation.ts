import { defineCard } from "../define.js";

export default defineCard({
  name: "Erratic Mutation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose target creature. Reveal cards from the top of your library until you reveal a nonland card. That creature gets +X/-X until end of turn, where X is that card's mana value. Put all cards revealed this way on the bottom of your library in any order.",
  targets: ["creature"],
  effect: {
    kind: "reveal-until",
    filter: { notTypes: ["land"] },
    then: {
      kind: "modify-pt",
      target: 1,
      power: { manaValueOf: 0 },
      toughness: { product: [{ manaValueOf: 0 }, -1] },
      duration: "end-of-turn",
    },
    thenKeepsTargets: true,
    rest: "bottom-any-order",
  },
});
