import { defineCard } from "../define.js";

// "One mana of any color" added as a triggered ability resolves is a choice
// spelled out as a mode over the five colours (the `add-mana` doc's Lotus
// Cobra shape). "Your first main phase" is the precombat main phase.
const MAIN_TEXT = "At the beginning of your first main phase, add one mana of any color.";

export default defineCard({
  name: "Forsaken Thresher",
  art: "https://cards.scryfall.io/art_crop/back/a/2/a27b9d82-f613-4789-9e8b-f37db5597027.jpg",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 5,
  text: MAIN_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Add {W}.", effect: { kind: "add-mana", mana: "W", amount: 1 } },
          { text: "Add {U}.", effect: { kind: "add-mana", mana: "U", amount: 1 } },
          { text: "Add {B}.", effect: { kind: "add-mana", mana: "B", amount: 1 } },
          { text: "Add {R}.", effect: { kind: "add-mana", mana: "R", amount: 1 } },
          { text: "Add {G}.", effect: { kind: "add-mana", mana: "G", amount: 1 } },
        ],
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
  faces: ["Foreboding Statue", "Forsaken Thresher"],
  transform: true,
});
