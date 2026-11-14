import { defineCard } from "../define.js";

// EDHREC rank 30201.
const ATTACKS = "Whenever this creature attacks, untap up to one other target creature.";

export default defineCard({
  name: "Triceraton Regenta",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Noble"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
