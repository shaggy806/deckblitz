import { defineCard } from "../define.js";

export default defineCard({
  name: "Take Up Arms",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Create three 1/1 white Warrior creature tokens.",
  effect: { kind: "create-token", token: "Warrior Token", count: 3 },
});
