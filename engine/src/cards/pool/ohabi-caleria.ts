import { defineCard } from "../define.js";

// Rulings:
//   [2022-09-09] Effects that say an Archer you control “doesn’t untap during your untap step” or
//     “doesn’t untap during its controller’s untap step” won’t prevent Ohabi Caleria from causing
//     you to untap it during other players’ untap steps.
//   [2022-09-09] All your Archers untap during each other player’s untap step. You have no choice
//     about what untaps.

export default defineCard({
  name: "Ohabi Caleria",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nUntap all Archers you control during each other player's untap step.\nWhenever an Archer you control deals damage to a creature, you may pay {2}. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { subtype: "Archer" }, to: "creature" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to draw a card?",
        cost: "{2}",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: "Whenever an Archer you control deals damage to a creature, you may pay {2}. If you do, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      untapsDuringOthersUntap: { subtype: "Archer" },
      text: "Untap all Archers you control during each other player's untap step.",
    },
  ],
});
