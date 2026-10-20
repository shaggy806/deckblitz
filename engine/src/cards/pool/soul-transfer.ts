import { defineCard } from "../define.js";

// EDHREC rank 13245.
//
// Rulings:
//   [2022-02-18] Once you cast Soul Transfer and choose both modes, it doesn't matter what happens
//     to the artifact or enchantment you control in response. Soul Transfer will still have both
//     modes chosen.
//   [2022-02-18] The artifact and the enchantment may be the same permanent.
//
// Will of the Sultai's `maxModesIf`, asked as the modes are chosen (rule
// 601.2b) — two separate `controls` clauses, so one artifact enchantment
// satisfies both.
export default defineCard({
  name: "Soul Transfer",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Choose one. If you control an artifact and an enchantment as you cast this spell, you may choose both instead.\n" +
    "• Exile target creature or planeswalker.\n" +
    "• Return target creature or planeswalker card from your graveyard to your hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: {
      condition: {
        kind: "all",
        of: [
          { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
          { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
        ],
      },
      maxModes: 2,
    },
    modes: [
      {
        text: "Exile target creature or planeswalker.",
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Return target creature or planeswalker card from your graveyard to your hand.",
        targets: [
          { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } },
        ],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
    ],
  },
});
