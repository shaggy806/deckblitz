import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 16292. A preparation card (rule 722): its prepare spell is Jump,
// the pool's own card — the same Oracle text. One already prepared doesn't
// become prepared again (the rulings; `become-prepared` does nothing then).
const ATTACK_TEXT = "Whenever this creature attacks, it becomes prepared.";

export default defineCard({
  name: "Encouraging Aviator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  prepareSpell: "Jump",
  text: `Flying\n${ATTACK_TEXT} ${PREPARED_REMINDER}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
