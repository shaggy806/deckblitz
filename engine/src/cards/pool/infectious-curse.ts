import { defineCard } from "../define.js";

// Accursed Witch's back face. The reduction reaches every spell its
// controller casts that targets the enchanted player, Auras and spells with
// other targets too, and no ability (its ruling).
const COST_TEXT = "Spells you cast that target enchanted player cost {1} less to cast.";
const UPKEEP_TEXT = "At the beginning of enchanted player's upkeep, that player loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Infectious Curse",
  art: "https://cards.scryfall.io/art_crop/back/8/0/8093f8b0-5d50-48ca-b616-e92535a47138.jpg",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  targets: ["player"],
  text: `Enchant player\n${COST_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, targetingEnchantedPlayer: true, reduceGeneric: 1, when: { caster: "you" } },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "active-player" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Accursed Witch", "Infectious Curse"],
  transform: true,
});
