import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, enchanted permanent's controller sacrifices a nonland permanent of their choice, then that player loses 1 life.";

export default defineCard({
  name: "Strangling Grasp",
  art: "https://cards.scryfall.io/art_crop/back/d/4/d4054ae6-0227-4d99-8cb5-72e8b5d0b726.jpg",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or planeswalker an opponent controls\n${UPKEEP_TEXT}`,
  targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // "That player" is the one who sacrificed, even when the enchanted
      // permanent was what they sacrificed: bound once by for-each-player.
      effect: {
        kind: "for-each-player",
        who: { controllerOf: "attached" },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "that-player", filter: { notTypes: ["land"] }, count: 1 },
            { kind: "lose-life", amount: 1, who: "that-player" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Vengeful Strangler", "Strangling Grasp"],
  transform: true,
});
