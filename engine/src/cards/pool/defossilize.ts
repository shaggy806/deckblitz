import { defineCard } from "../define.js";

export default defineCard({
  name: "Defossilize",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield. That creature explores, then it explores again. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard. Then repeat this process.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "explore", target: 0, times: 2 },
    ],
  },
});
