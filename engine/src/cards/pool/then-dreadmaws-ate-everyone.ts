import { defineCard } from "../define.js";

export default defineCard({
  name: "Then, Dreadmaws Ate Everyone",
  manaCost: "{X}{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create X 6/6 green Dinosaur creature tokens with trample named Colossal Dreadmaw.",
  effect: { kind: "create-token", token: "Colossal Dreadmaw Token", count: "x" },
});
