import { defineCard } from "../define.js";

export default defineCard({
  name: "Into the Fae Court",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw three cards. Create a 1/1 blue Faerie creature token with flying and \"This token can block only creatures with flying.\"",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "create-token", token: "Faerie Token (Into the Fae Court)", count: 1 },
    ],
  },
});
