import { defineCard } from "../define.js";

export default defineCard({
  name: "Grisly Ritual",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature or planeswalker. Create two Blood tokens. (They're artifacts with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "create-token", token: "Blood Token", count: 2 }],
  },
});
