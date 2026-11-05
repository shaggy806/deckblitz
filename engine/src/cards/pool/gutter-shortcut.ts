import { defineCard } from "../define.js";

// Security Bypass's shape: attacking, and no other creature its controller
// controls is (rule 506.5).

const ALONE_TEXT = "Enchanted creature can't be blocked as long as it's attacking alone.";
const EXILE_TEXT = "If Gutter Shortcut would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Gutter Shortcut",
  art: "https://cards.scryfall.io/art_crop/back/c/e/ceb84515-7b8f-444d-b6a9-61231621f9b7.jpg",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: `Enchant creature\n${ALONE_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { attachedTo: { attacking: true } } },
          {
            kind: "of-player",
            player: "host-controller",
            condition: { kind: "not", of: { kind: "controls", filter: { attacking: true }, atLeast: 2 } },
          },
        ],
      },
      restrictions: ["cant-be-blocked"],
      text: ALONE_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Gutter Skulker", "Gutter Shortcut"],
  transform: true,
});
