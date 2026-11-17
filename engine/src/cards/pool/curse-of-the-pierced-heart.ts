import { defineCard } from "../define.js";

// EDHREC rank 12918.
//
// "That player or a planeswalker that player controls" isn't targeted: the Aura's controller
// chooses as the trigger resolves — a mode, and for a planeswalker which one (Vial Smasher the
// Fierce's shape: a `vote` with `choose`, then the damage to what was chosen). "That player" is
// the enchanted player whose upkeep it is: the active player.

const TEXT =
  "At the beginning of enchanted player's upkeep, this Aura deals 1 damage to that player or a planeswalker that player controls.";

export default defineCard({
  name: "Curse of the Pierced Heart",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Deal the damage to that player", effect: { kind: "damage", amount: 1, who: "active-player" } },
          {
            text: "Deal the damage to a planeswalker that player controls",
            onlyIf: {
              kind: "of-player",
              player: "active-player",
              condition: { kind: "controls", filter: { type: "planeswalker" }, atLeast: 1 },
            },
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "vote",
                  choose: true,
                  who: "you",
                  for: {
                    permanent: { type: "planeswalker" },
                    about: "active-player",
                    prompt: "Choose a planeswalker that player controls to deal the damage to",
                  },
                },
                { kind: "damage-all", filter: { thisWay: "chosen" }, amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
