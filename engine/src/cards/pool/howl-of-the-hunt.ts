import { defineCard } from "../define.js";

// An intervening "if" (rule 603.4) on the enchanted creature as the Aura
// enters and again as the ability resolves — the one it last enchanted, if
// the Aura has left — then `"attached"` untaps it.
const ENTERS = "When this Aura enters, if enchanted creature is a Wolf or Werewolf, untap that creature.";
const PUMP = "Enchanted creature gets +2/+2 and has vigilance.";

export default defineCard({
  name: "Howl of the Hunt",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${ENTERS}\n${PUMP}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { attachedTo: { subtypes: ["Wolf", "Werewolf"] } } },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], grantKeywords: ["vigilance"], text: PUMP }],
});
