import { defineCard } from "../define.js";

// EDHREC rank 15417. Imprint links the two abilities (rule 607.2a), as
// Isochron Scepter's does; it imprints once, as it enters, so there is only
// ever one exiled card to copy. "You may copy … If you do, you may cast the
// copy" is one "may": a copy not cast ceases to exist (rule 704.5e).

const IMPRINT = "Imprint — When this Equipment enters, you may exile an instant card from your hand.";
const COPY =
  "Whenever equipped creature deals combat damage to a player, you may copy the exiled card. If you do, you may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Spellbinder",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${IMPRINT}\n${COPY}\nEquip {4}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "exile",
        leftover: "stay",
        filter: { type: "instant" },
      },
      resolve: null,
      text: IMPRINT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", copies: 1, free: true },
      resolve: null,
      text: COPY,
    },
  ],
});
