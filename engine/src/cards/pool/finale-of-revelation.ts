import { defineCard } from "../define.js";

export default defineCard({
  name: "Finale of Revelation",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw X cards. If X is 10 or more, instead shuffle your graveyard into your library, draw X cards, untap up to five lands, and you have no maximum hand size for the rest of the game.\nExile Finale of Revelation.",
  exileOnResolve: true,
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "x", compare: { op: "gte", n: 10 } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "shuffle-graveyard-into-library", target: "you" },
        { kind: "draw", amount: "x" },
        {
          kind: "choose-permanents",
          filter: { type: "land" },
          upTo: 5,
          then: { kind: "untap", target: 0 },
          prompt: "Untap up to five lands",
        },
        { kind: "player-effect", duration: "permanent", noMaxHandSize: "you" },
      ],
    },
    else: { kind: "draw", amount: "x" },
  },
});
