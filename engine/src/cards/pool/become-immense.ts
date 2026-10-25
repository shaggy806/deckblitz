import { defineCard } from "../define.js";

// EDHREC rank 9825.
export default defineCard({
  name: "Become Immense",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nTarget creature gets +6/+6 until end of turn.",
  delve: true,
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 6, toughness: 6, duration: "end-of-turn" },
});
