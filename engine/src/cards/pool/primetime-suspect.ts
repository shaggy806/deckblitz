import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Whether enchanted creature is suspected
// is read as the trigger resolves: two lands if it is, one if not. Any land
// card, not only a basic.
const ATTACK_TEXT =
  "Whenever enchanted creature attacks, you may search your library for a land card, put that card onto the battlefield tapped, then shuffle. If enchanted creature is suspected, you search for two lands instead.";

export default defineCard({
  name: "Primetime Suspect",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACK_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a land card (two if enchanted creature is suspected)?",
        effect: {
          kind: "conditional",
          condition: { kind: "source", filter: { attachedTo: { suspected: true } } },
          then: {
            kind: "search-library",
            filter: { type: "land" },
            destination: "battlefield",
            enterTapped: true,
            min: 0,
            max: 2,
          },
          else: {
            kind: "search-library",
            filter: { type: "land" },
            destination: "battlefield",
            enterTapped: true,
            min: 0,
            max: 1,
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
