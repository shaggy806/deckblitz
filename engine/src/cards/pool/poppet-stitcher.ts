import { defineCard } from "../define.js";

// EDHREC rank 6686.
//
// Rulings:
//   [2021-09-24] Decayed does not create any attacking requirements. You may choose not to attack
//     with a creature that has decayed.
//   [2021-09-24] Once a creature with decayed attacks, it will be sacrificed at end of combat,
//     even if it no longer has decayed at that time.

const ZOMBIE_TEXT = "Whenever you cast an instant or sorcery spell, create a 2/2 black Zombie creature token with decayed.";
const TRANSFORM_TEXT = "At the beginning of your upkeep, if you control three or more creature tokens, you may transform this creature.";

export default defineCard({
  name: "Poppet Stitcher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${ZOMBIE_TEXT} (It can't block. When it attacks, sacrifice it at end of combat.)\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
      resolve: null,
      text: ZOMBIE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", token: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Transform Poppet Stitcher?",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Poppet Stitcher", "Poppet Factory"],
  transform: true,
});
