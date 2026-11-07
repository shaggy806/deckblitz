import { defineCard } from "../define.js";

const copyText =
  "Whenever you cast an instant or sorcery spell or activate an ability, if that spell's mana cost or that ability's activation cost contains {X}, copy that spell or ability. You may choose new targets for the copy.";

export default defineCard({
  name: "Unbound Flourishing",
  art: "https://scryfall.com/card/soc/126",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Whenever you cast a permanent spell with a mana cost that contains {X}, double the value of X.\n${copyText}`,
  triggered: [
    {
      // An X of 0 doubles to 0, and no more mana is paid (the rulings).
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"], xInManaCost: true },
      },
      targets: [],
      effect: { kind: "double-x", target: "trigger-spell" },
      resolve: null,
      text: "Whenever you cast a permanent spell with a mana cost that contains {X}, double the value of X.",
    },
    {
      // {X} in its mana cost, not an additional cost's (the rulings); the
      // copy has the same X and modes (rule 707.10).
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"], xInManaCost: true } },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: copyText,
    },
    {
      // The mana symbol {X} in its activation cost — never a mana ability,
      // which doesn't use the stack (rule 605.3b).
      trigger: { on: "activates-ability", who: "you", xInCost: true },
      targets: [],
      effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      resolve: null,
      text: copyText,
    },
  ],
});
