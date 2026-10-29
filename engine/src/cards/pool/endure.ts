import { defineCard } from "../define.js";

// EDHREC rank 27314.
export default defineCard({
  name: "Endure",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to you and permanents you control this turn.",
  targets: [],
  effect: { kind: "damage-rule", to: { players: "you", permanents: { controlledBy: "you" } } },
});
