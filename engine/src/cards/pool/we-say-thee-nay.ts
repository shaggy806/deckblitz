import { defineCard } from "../define.js";

export default defineCard({
  name: "We Say Thee Nay!",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text:
    "Teamwork 2 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 2 or more.)\n" +
    "Counter target spell unless its controller pays {2}. Counter that spell unless its controller pays {4} instead if this spell was cast using teamwork.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{2}", text: "Pay {2}" }],
    otherwise: { kind: "counter", target: 0 },
  },
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 2,
    effect: {
      kind: "unless",
      chooser: 0,
      options: [{ pay: "{4}", text: "Pay {4}" }],
      otherwise: { kind: "counter", target: 0 },
    },
  },
});
