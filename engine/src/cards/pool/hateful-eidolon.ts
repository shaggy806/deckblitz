import { defineCard } from "../define.js";

// Any enchanted creature triggers it; the draw counts only your Auras on it, as
// they were attached when it died (a creature enchanted only by others' Auras
// draws nothing, as printed).
const TEXT = "Whenever an enchanted creature dies, draw a card for each Aura you controlled that was attached to it.";

export default defineCard({
  name: "Hateful Eidolon",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", enchanted: true } },
      targets: [],
      effect: {
        kind: "draw",
        amount: {
          aggregate: "count",
          filter: { subtype: "Aura", controlledBy: "you" },
          in: { attachmentsOf: "trigger-object" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
