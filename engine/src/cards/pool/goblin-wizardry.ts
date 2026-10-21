import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Wizardry",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Create two 1/1 red Goblin Wizard creature tokens with prowess. (Whenever you cast a noncreature spell, they get +1/+1 until end of turn.)",
  targets: [],
  effect: { kind: "create-token", token: "Goblin Wizard Token", count: 2 },
});
