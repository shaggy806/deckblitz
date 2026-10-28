import { defineCard } from "../define.js";

// EDHREC rank 16294.

export default defineCard({
  name: "Blessed Breath",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{W}" },
  text: "Target creature you control gains protection from the color of your choice until end of turn.\nSplice onto Arcane {W} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["creature-you-control"],
  effect: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
});
