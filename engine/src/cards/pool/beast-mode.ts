import { defineCard } from "../define.js";

// EDHREC rank 26860.

const PUMP = [
  { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
] as const;

export default defineCard({
  name: "Beast Mode",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Teamwork 1 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 1 or more.)\nTarget creature gets +2/+2 and gains trample until end of turn. Also put a +1/+1 counter on that creature if this spell was cast using teamwork.",
  targets: ["creature"],
  effect: { kind: "sequence", effects: [...PUMP] },
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 1,
    effect: {
      kind: "sequence",
      effects: [...PUMP, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }],
    },
  },
});
