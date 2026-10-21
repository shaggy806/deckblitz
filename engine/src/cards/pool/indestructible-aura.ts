import { defineCard } from "../define.js";

// EDHREC rank 23985. Not an Aura, and it prevents damage only (the ruling).

export default defineCard({
  name: "Indestructible Aura",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to target creature this turn.",
  targets: ["creature"],
  effect: { kind: "prevent-damage", target: 0, amount: "all" },
});
