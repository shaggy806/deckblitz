import { defineCard } from "../define.js";

// EDHREC rank 23319.
//
// Rulings:
//   [2025-07-25] The last mode of Brilliance Unleashed doesn't remove any abilities the artifact
//     has.
//
// The second mode's card is a 3/3 Robot artifact creature with flying as it
// enters (`enterAs`, rule 614.12 — so it's a creature to every "creature
// enters" trigger), its other card types and subtypes kept (rule 205.1b's
// "[creature type] artifact creature").
const TEXT =
  "Choose one or both —\n• Brilliance Unleashed deals 5 damage to target creature.\n• Choose target artifact card in your graveyard. Return it to the battlefield if it's an artifact creature card. Otherwise, return it to the battlefield and it's a 3/3 Robot artifact creature with flying.";

export default defineCard({
  name: "Brilliance Unleashed",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Brilliance Unleashed deals 5 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
      {
        text: "Choose target artifact card in your graveyard. Return it to the battlefield if it's an artifact creature card. Otherwise, return it to the battlefield and it's a 3/3 Robot artifact creature with flying.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
        effect: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "creature" } },
          then: { kind: "put-onto-battlefield", target: 0 },
          else: {
            kind: "put-onto-battlefield",
            target: 0,
            enterAs: { addTypes: ["creature"], addSubtypes: ["Robot"], power: 3, toughness: 3, keywords: ["flying"] },
          },
        },
      },
    ],
  },
});
