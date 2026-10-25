import { defineCard } from "../define.js";

// EDHREC rank 22059.

export default defineCard({
  name: "Join the Ranks",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Create two 1/1 white Soldier Ally creature tokens.",
  effect: { kind: "create-token", token: "Soldier Ally Token", count: 2 },
});
