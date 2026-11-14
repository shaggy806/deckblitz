import { defineCard } from "../define.js";

export default defineCard({
  name: "Lost in the Spirit World",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: 'Return up to one target creature to its owner\'s hand. Create a 1/1 colorless Spirit creature token with "This token can\'t block or be blocked by non-Spirit creatures."',
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "create-token", token: "Spirit Token (Colorless, Evasive)", count: 1 },
    ],
  },
});
