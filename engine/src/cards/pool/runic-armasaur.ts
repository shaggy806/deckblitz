import { defineCard } from "../define.js";

// EDHREC rank 2478.
//
// Rulings:
//   [2018-07-13] Runic Armasaur's ability doesn't trigger when an opponent activates an ability of
//     a card in hand (such as a cycling ability from the Amonkhet block) or a card in a graveyard
//     (such as that of Bone Dragon), even if that causes a card to be put onto the battlefield.
//   [2018-07-13] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keyword abilities are activated abilities and will have colons in their
//     reminder text. An activated mana ability is one that produces mana as it resolves, not one
//     that costs mana to activate.
//   [2018-07-13] Runic Armasaur's ability resolves before the ability that caused it to trigger.
//     Players can cast spells and activate abilities after the triggered ability resolves but
//     before the activated ability that caused it to trigger does.
//   [2018-07-13] Runic Armasaur's ability doesn't trigger when an opponent activates an ability of
//     a noncreature, nonland permanent that causes it to become a creature (such as a crew ability
//     of a Vehicle).

export default defineCard({
  name: "Runic Armasaur",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 5,
  text: "Whenever an opponent activates an ability of a creature or land that isn't a mana ability, you may draw a card.",
  triggered: [
    {
      // A permanent's ability only — not a card's in a hand or graveyard,
      // nor a Vehicle's crew (the rulings).
      trigger: { on: "activates-ability", who: "opponent", source: { typesAnyOf: ["creature", "land"] } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever an opponent activates an ability of a creature or land that isn't a mana ability, you may draw a card.",
    },
  ],
});
