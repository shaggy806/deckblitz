import { defineCard } from "../define.js";

// EDHREC rank 7266. "That creature's controller" is the dead creature's
// controller as it last existed — the Aura's owner or not — and the search is
// theirs, optional (the rulings): declining it doesn't shuffle.
const TEXT =
  "When enchanted creature dies, that creature's controller may search their library for a creature card, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Pattern of Rebirth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Search your library for a creature card and put it onto the battlefield?",
        effect: { kind: "search-library", filter: { type: "creature" }, destination: "battlefield", min: 0, max: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
