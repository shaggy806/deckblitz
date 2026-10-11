import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Replenish, the pool's
// own card. No intervening if: once it triggers, what happens to the
// attackers doesn't matter (the ruling).
const PREPARE_TEXT = `Whenever you attack with two or more creatures, this creature becomes prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Eiganjo Dynastorian",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Advisor"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  prepareSpell: "Replenish",
  text: `Vigilance\n${PREPARE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
});
