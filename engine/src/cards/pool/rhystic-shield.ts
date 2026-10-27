import { defineCard } from "../define.js";

// EDHREC rank 30034. Only the creatures you control as it resolves (the
// ruling): both parts apply then, the second behind a rhystic `unless`.

export default defineCard({
  name: "Rhystic Shield",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +0/+1 until end of turn. They get an additional +0/+2 until end of turn unless any player pays {2}.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 0,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "unless",
        chooser: "any-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 0,
          toughness: 2,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
