import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever this creature attacks, untap another target creature you control.";

export default defineCard({
  name: "Tenth District Veteran",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
