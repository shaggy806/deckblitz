import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 26086. Rites of Refusal's "discard any number",
// counted by `thisWay` into Pyretic Charge's anthem.

export default defineCard({
  name: "Sacred Rites",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Discard any number of cards. Creatures you control get +0/+1 until end of turn for each card discarded this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 0, anyNumber: true },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 0,
        toughness: { thisWay: "discarded", who: "you" },
        duration: "end-of-turn",
      },
    ],
  },
});
