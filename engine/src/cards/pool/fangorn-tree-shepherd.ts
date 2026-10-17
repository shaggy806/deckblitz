import { defineCard } from "../define.js";

// EDHREC rank 7291.
//
// Rulings:
//   [2023-06-16] You can keep unspent green mana indefinitely while Fangorn, Tree Shepherd is on
//     the battlefield. That means if you add a green mana during one step or phase, you can spend
//     it during a later step or phase, or even a later turn. Other types of mana will be lost as
//     normal as each step and phase ends.
//   [2023-06-16] Once Fangorn, Tree Shepherd leaves the battlefield, you have until the end of the
//     current step or phase to spend your unspent green mana before it is lost as normal.

const VIGILANCE_TEXT = "Treefolk you control have vigilance.";
const ATTACK_TEXT = "Whenever one or more Treefolk you control attack, add twice that much {G}.";
const KEEP_TEXT = "You don't lose unspent green mana as steps and phases end.";

export default defineCard({
  name: "Fangorn, Tree Shepherd",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 10,
  text: `${VIGILANCE_TEXT}\n${ATTACK_TEXT}\n${KEEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Treefolk", controlledBy: "you" } },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
    {
      affects: { scope: "self" },
      keepsUnspentMana: ["G"],
      text: KEEP_TEXT,
    },
  ],
  triggered: [
    {
      // Batched: once per declaration, the trigger value being how many
      // Treefolk attacked ("that much").
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Treefolk", controlledBy: "you" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { product: [{ triggerValue: true }, 2] } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
