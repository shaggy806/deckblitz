import { defineCard } from "../define.js";

// EDHREC rank 17015. Heroic (Akroan Skyguard's trigger) with Protean
// Thaumaturge's copy: the target is chosen as the trigger goes on the stack,
// whether to copy as it resolves (the ruling). "Target creature" — not
// "another" — so it may target itself.
const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, you may have this creature become a copy of target creature, except it has this ability.";

export default defineCard({
  name: "Artisan of Forms",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: HEROIC_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Artisan of Forms become a copy of target creature, except it has this ability?",
        effect: {
          kind: "become-copy",
          target: "source",
          of: 0,
          exceptions: { thisAbility: { card: "Artisan of Forms", triggered: 0 } },
        },
      },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
