import { defineCard } from "../define.js";

// An intervening "if" (rule 603.4): the enchanted creature has toxic as the
// Aura enters and again as the ability resolves — the one it last enchanted,
// if the Aura has left.
const ENTERS =
  "When this Aura enters, if enchanted creature has toxic, that creature gains hexproof until end of turn.";

export default defineCard({
  name: "Maze's Mantle",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${ENTERS}\nEnchanted creature gets +2/+2.`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { attachedTo: { hasToxic: true } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
