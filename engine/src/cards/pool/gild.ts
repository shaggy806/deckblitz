import { defineCard } from "../define.js";

export default defineCard({
  name: "Gild",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature. Create a Gold token. (It's an artifact with \"Sacrifice this token: Add one mana of any color.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "exile", target: 0 }, { kind: "create-token", token: "Gold Token", count: 1 }],
  },
});
