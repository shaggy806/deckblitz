import { defineCard } from "../define.js";

// The creatures are exiled before the die is rolled (the ruling): the
// `flicker` with `returnAt` exiles them and sets up the one delayed return,
// and 10—20 returns "those cards" now and exiles them again (`reflicker`),
// still linked to that return. 1—9 adds nothing to it. Auras fall off and
// counters are lost; each return is a new object (rule 400.7).
export default defineCard({
  name: "Lae'zel's Acrobatics",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Exile all nontoken creatures you control, then roll a d20.\n" +
    "1—9 | Return those cards to the battlefield under their owner's control at the beginning of the next end step.\n" +
    "10—20 | Return those cards to the battlefield under their owner's control, then exile them again. Return those cards to the battlefield under their owner's control at the beginning of the next end step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "flicker",
        target: { all: { type: "creature", token: false, controlledBy: "you" } },
        returnAt: { step: "end" },
        returnText: "Return those cards to the battlefield under their owner's control.",
      },
      { kind: "roll-dice", sides: 20, table: [{ min: 10, effect: { kind: "reflicker" } }] },
    ],
  },
});
