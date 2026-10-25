import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 17661.
//
// Rulings:
//   It affects all opposing players in a multiplayer game.
//
// "Put into an opponent's graveyard from the battlefield" is a creature an
// opponent owns dying (Magus of the Bridge's trigger); its toughness is read
// as it last existed on the battlefield (rule 603.10a).

const DIES_TEXT =
  "Whenever a creature is put into an opponent's graveyard from the battlefield, you gain life equal to its toughness.";

export default defineCard({
  name: "Grim Feast",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, this enchantment deals 1 damage to you.\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, this enchantment deals 1 damage to you.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "opponent" } },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
