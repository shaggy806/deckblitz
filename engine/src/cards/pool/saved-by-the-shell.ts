import { defineCard } from "../define.js";

// EDHREC rank 10991.

export default defineCard({
  name: "Saved by the Shell",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if you control a Turtle.\nPut a +1/+1 counter on target creature you control. It gains trample, hexproof, and indestructible until end of turn.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Turtle" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
