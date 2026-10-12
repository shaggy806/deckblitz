import { defineCard } from "../define.js";

// EDHREC rank 12329. Repartee — Informed Inkwright's trigger, Karok
// Wrangler's effect.
const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Graduation Day",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: REPARTEE_TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
