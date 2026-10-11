import { defineCard } from "../define.js";
import { entersPrepared } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Regrowth, the pool's
// own card. "If you control eight or more lands" is an intervening if (rule
// 603.4): checked as it would trigger and again as it resolves (the ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks, if you control eight or more lands, this creature becomes prepared.";

export default defineCard({
  name: "Emeritus of Abundance",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  prepareSpell: "Regrowth",
  text: `Vigilance\nThis creature enters prepared.\n${ATTACK_TEXT}`,
  static: [entersPrepared()],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 8 },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
