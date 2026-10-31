import { defineCard } from "../define.js";

// "You may choose the same mode more than once" (rule 700.2d): the modes
// chosen are done in printed order, a mode chosen twice done twice — three
// times 2 damage to each opponent is 6, each a separate event.
const MODE_CREATURES = "Fiery Confluence deals 1 damage to each creature.";
const MODE_OPPONENTS = "Fiery Confluence deals 2 damage to each opponent.";
const MODE_ARTIFACT = "Destroy target artifact.";

export default defineCard({
  name: "Fiery Confluence",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose three. You may choose the same mode more than once.\n• ${MODE_CREATURES}\n• ${MODE_OPPONENTS}\n• ${MODE_ARTIFACT}`,
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      { text: MODE_CREATURES, effect: { kind: "damage-all", amount: 1, filter: { type: "creature" } } },
      { text: MODE_OPPONENTS, effect: { kind: "damage", amount: 2, who: "each-opponent" } },
      { text: MODE_ARTIFACT, targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
    ],
  },
});
