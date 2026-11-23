import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2).

export default defineCard({
  name: "Believe in the Cleave",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Believe in the Cleave costs {1} less to cast for each attacking creature you control.\nTarget creature gets +1/+1 and gains double strike and trample until end of turn.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", attacking: true, controlledBy: "you" } },
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
