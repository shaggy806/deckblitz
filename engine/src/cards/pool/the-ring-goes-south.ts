import { defineCard } from "../define.js";

export default defineCard({
  name: "The Ring Goes South",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "The Ring tempts you. Then reveal cards from the top of your library until you reveal X land cards, where X is the number of legendary creatures you control. Put those land cards onto the battlefield tapped and the rest on the bottom of your library in a random order.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "the-ring-tempts-you" },
      {
        kind: "reveal-until-count",
        filter: { type: "land" },
        count: { countOf: { type: "creature", supertype: "legendary", controlledBy: "you" } },
        put: "battlefield",
        tapped: true,
        rest: "bottom-random",
      },
    ],
  },
});
