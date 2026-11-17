import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever you activate an ability that isn't a mana ability, if life was paid to activate it, you may pay that much life again. If you do, copy that ability. You may choose new targets for the copy.";

// "That much" is the life the ability's own cost paid — a life cost, or
// Phyrexian mana paid with life (rules 119.4, 107.4f) — not a mana ability's
// that helped pay it. The copy keeps the cost's choices, X, modes and any
// division (the rulings); it's made even if the ability was countered first,
// as it last was on the stack.
export default defineCard({
  name: "Verrak, Warped Sengir",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "deathtouch", "lifelink"],
  text: `Flying, deathtouch, lifelink\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", lifePaidToActivate: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay that much life again to copy that ability?",
        costLife: { triggerValue: true },
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
