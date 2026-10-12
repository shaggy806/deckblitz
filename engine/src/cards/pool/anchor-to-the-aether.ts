import { defineCard } from "../define.js";

export default defineCard({
  name: "Anchor to the Aether",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Put target creature on top of its owner's library. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "put-on-library", target: 0, position: "top" }, { kind: "scry", amount: 1 }],
  },
});
