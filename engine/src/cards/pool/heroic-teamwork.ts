import { defineCard } from "../define.js";

// EDHREC rank 28710.

const PUMP = [
  { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
  { kind: "modify-pt", target: 1, power: 2, toughness: 1, duration: "end-of-turn" },
] as const;

export default defineCard({
  name: "Heroic Teamwork",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Teamwork 3 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 3 or more.)\nOne or two target creatures each get +2/+1 until end of turn. If this spell was cast using teamwork, draw a card.",
  // "One or two" — Opera Love Song's shape: one target required, a second
  // optional and different.
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: { kind: "sequence", effects: [...PUMP] },
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 3,
    effect: { kind: "sequence", effects: [...PUMP, { kind: "draw", amount: 1 }] },
  },
});
