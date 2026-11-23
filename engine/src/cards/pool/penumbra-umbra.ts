import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). The copy is of the creature the Aura was
// attached to as it went to the graveyard, as it last existed if it has left
// too (the ruling) — Followed Footsteps' `"enchanted"`, which reads the
// creature the Aura was last attached to once the Aura has left.

const DIES_TEXT =
  "When Penumbra Umbra is put into a graveyard from the battlefield, create a token that's a copy of enchanted creature, except the token is black.";

export default defineCard({
  name: "Penumbra Umbra",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: `Enchant creature you control\n${DIES_TEXT}\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "enchanted",
        count: 1,
        who: "you",
        exceptions: { setColors: ["B"] },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
