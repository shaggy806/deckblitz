import { defineCard } from "../define.js";

// EDHREC rank 10244.
//
// A redirection rule for the turn (rule 614.9), its recipient the creature
// the Aura enchants as the trigger resolves — kept even if the Aura leaves
// later (the ruling); while that creature isn't on the battlefield or isn't a
// creature, nothing is redirected (the ruling). The enchanted creature's own
// damage stays where it is. Redirected damage keeps its source and whether
// it's combat damage (the ruling).

const TRIGGER_TEXT =
  "When this Aura enters, all damage that would be dealt this turn to you and permanents you control is dealt to enchanted creature instead.";

export default defineCard({
  name: "Saving Grace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature you control\n${TRIGGER_TEXT}\nEnchanted creature gets +0/+3.`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "damage-rule",
        to: { players: "you", permanents: { controlledBy: "you" }, exceptTarget: "attached" },
        redirectTo: "attached",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 3], text: "Enchanted creature gets +0/+3." }],
});
