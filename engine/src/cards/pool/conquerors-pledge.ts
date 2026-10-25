import { defineCard } from "../define.js";

// EDHREC rank 18527. Saproling Migration's kicker shape: the kicked spell's
// whole effect, twelve Kor Soldiers in place of six.

export default defineCard({
  name: "Conqueror's Pledge",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Kicker {6} (You may pay an additional {6} as you cast this spell.)\nCreate six 1/1 white Kor Soldier creature tokens. If this spell was kicked, create twelve of those tokens instead.",
  targets: [],
  effect: { kind: "create-token", token: "Kor Soldier Token", count: 6 },
  kicker: { cost: "{6}", effect: { kind: "create-token", token: "Kor Soldier Token", count: 12 } },
});
