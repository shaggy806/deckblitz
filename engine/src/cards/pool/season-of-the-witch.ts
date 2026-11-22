import { defineCard } from "../define.js";

// EDHREC rank 20680.
//
// "Creatures that couldn't attack": a creature that couldn't have been declared
// an attacker as any declare attackers step this turn began (rule 508.1a) —
// tapped then, summoning sick, under a "can't attack", controlled by a player
// whose turn it isn't, or put onto the battlefield after the declaration (a
// new object, rule 400.7); a turn with no combat had nothing that could. A cost to attack doesn't stop a creature attacking (508.1d), so
// one its controller wouldn't pay for could have. The `could-attack` journal
// entries, read through `journaled`.

const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you pay 2 life.";
const END = "At the beginning of the end step, destroy all untapped creatures that didn't attack this turn, except for creatures that couldn't attack.";

export default defineCard({
  name: "Season of the Witch",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${END}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ payLife: 2, text: "Pay 2 life." }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { type: "creature", tapped: false, attackedThisTurn: false, journaled: { what: "could-attack" } },
      },
      resolve: null,
      text: END,
    },
  ],
});
