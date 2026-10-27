import { defineCard } from "../define.js";

export default defineCard({
  name: "Bind",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Counter target activated ability. (Mana abilities can't be targeted.)\nDraw a card.",
  targets: [{ kind: "ability", abilityKind: "activated" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
