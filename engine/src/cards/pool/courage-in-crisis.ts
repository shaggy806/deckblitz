import { defineCard } from "../define.js";

export default defineCard({
  name: "Courage in Crisis",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature, then proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, { kind: "proliferate" }],
  },
});
