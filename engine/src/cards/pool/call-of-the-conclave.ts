import { defineCard } from "../define.js";

// EDHREC rank 19554.

export default defineCard({
  name: "Call of the Conclave",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "Create a 3/3 green Centaur creature token.",
  targets: [],
  effect: { kind: "create-token", token: "3/3 Centaur Token", count: 1 },
});
