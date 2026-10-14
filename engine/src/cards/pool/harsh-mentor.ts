import { defineCard } from "../define.js";

// EDHREC rank 2498.
//
// Rulings:
//   [2017-04-18] Harsh Mentor's ability resolves before the ability that caused it to trigger.
//   [2017-04-18] Harsh Mentor's ability doesn't trigger when an opponent activates an ability of a
//     card in hand (such as cycling) or a card in a graveyard (such as embalm), even if that
//     causes a card to be put onto the battlefield.
//   [2017-04-18] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keyword abilities (such as equip) are activated abilities and will have
//     colons in their reminder text. An activated mana ability is one that produces mana as it
//     resolves, not one that costs mana to activate. Notably, exerting a creature isn't an
//     activated ability.

export default defineCard({
  name: "Harsh Mentor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Whenever an opponent activates an ability of an artifact, creature, or land on the battlefield, if it isn't a mana ability, this creature deals 2 damage to that player.",
  triggered: [
    {
      // Never a mana ability: those don't use the stack.
      trigger: {
        on: "activates-ability",
        who: "opponent",
        source: { typesAnyOf: ["artifact", "creature", "land"] },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-player" },
      resolve: null,
      text: "Whenever an opponent activates an ability of an artifact, creature, or land on the battlefield, if it isn't a mana ability, this creature deals 2 damage to that player.",
    },
  ],
});
