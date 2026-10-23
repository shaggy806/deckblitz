import { defineCard } from "../define.js";

export default defineCard({
  name: "Just the Wind",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  madness: { cost: "{U}" },
  text: "Return target creature to its owner's hand.\nMadness {U} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["creature"],
  effect: { kind: "return-to-hand", target: 0 },
});
