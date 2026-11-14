import { defineCard } from "../define.js";

export default defineCard({
  name: "Step Right Up",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Open two Attractions. (Put the top two cards of your Attraction deck onto the battlefield.)",
  effect: { kind: "open-attraction", count: 2 },
});
