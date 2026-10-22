import { defineCard } from "../define.js";

// EDHREC rank 29617. Fallen Empires.

export default defineCard({
  name: "Icatian Town",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create four 1/1 white Citizen creature tokens.",
  effect: { kind: "create-token", token: "White Citizen Token", count: 4 },
});
