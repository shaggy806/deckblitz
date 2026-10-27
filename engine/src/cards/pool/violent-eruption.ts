import { defineCard } from "../define.js";

// Torment. EDHREC rank 14704. Explosive Crystal's divided damage (the number
// of targets and the division chosen as it's cast, at least 1 to each — rule
// 601.2d) with Arrogant Wurm's madness.

export default defineCard({
  name: "Violent Eruption",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Violent Eruption deals 4 damage divided as you choose among any number of targets.\nMadness {1}{R}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: [{ kind: "any-number", of: "any-target", max: 4 }],
  divided: { total: 4, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
  madness: { cost: "{1}{R}{R}" },
});
