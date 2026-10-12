import { defineCard } from "../define.js";

// EDHREC rank 13537. Marvel Super Heroes.
//
// Winged Words' self cost reduction (any Villain permanent you control),
// then Night's Whisper.
export default defineCard({
  name: "Visions of Villainy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if you control a Villain.\nYou draw two cards and lose 2 life.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Villain" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "lose-life", amount: 2, who: "you" },
    ],
  },
});
