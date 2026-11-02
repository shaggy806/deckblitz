import { defineCard } from "../define.js";

export default defineCard({
  name: "Reverent Silence",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "If you control a Forest, rather than pay this spell's mana cost, you may have each other player gain 6 life.\nDestroy all enchantments.",
  alternativeCost: {
    mana: "{0}",
    othersGainLife: { amount: 6, who: "each-other-player" },
    condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
  },
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment" } },
});
