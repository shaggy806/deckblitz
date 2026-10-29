import { defineCard } from "../define.js";

// EDHREC rank 2965.
//
// Rulings:
//   [2005-02-01] If the Jitte is moved after the "+2/+2" mode is announced but before it resolves,
//     the bonus is given to the creature that is equipped when the ability resolves.
//   [2005-02-01] The ability can be used any time Umezawa's Jitte's controller has priority — only
//     the "target creature" choice has additional requirements. Choosing the "Equipped creature
//     gets +2/+2 until end of turn" mode does nothing if the Jitte isn't equipped to a creature
//     when the ability resolves.
//   [2005-02-01] If the "target creature gets -1/-1 until end of turn" mode is chosen, the target
//     creature must also be announced.
//   [2005-02-01] Umezawa's Jitte's activated ability generates a modal choice. The choice is made
//     when the ability is activated.
//   [2005-02-01] If the Jitte leaves the battlefield after the "+2/+2" mode is announced but
//     before it resolves, the bonus is given to the creature that was most recently equipped once
//     the ability resolves.

export default defineCard({
  name: "Umezawa's Jitte",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Whenever equipped creature deals combat damage, put two charge counters on Umezawa's Jitte.\nRemove a charge counter from Umezawa's Jitte: Choose one —\n• Equipped creature gets +2/+2 until end of turn.\n• Target creature gets -1/-1 until end of turn.\n• You gain 2 life.\nEquip {2}",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      // Chosen as it's activated (its ruling); "equipped creature" is the one
      // equipped as it resolves.
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Equipped creature gets +2/+2 until end of turn.",
            effect: { kind: "modify-pt", target: "attached", power: 2, toughness: 2, duration: "end-of-turn" },
          },
          {
            text: "Target creature gets -1/-1 until end of turn.",
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
          },
          { text: "You gain 2 life.", effect: { kind: "gain-life", amount: 2 } },
        ],
      },
      resolve: null,
      text: "Remove a charge counter from Umezawa's Jitte: Choose one —\n• Equipped creature gets +2/+2 until end of turn.\n• Target creature gets -1/-1 until end of turn.\n• You gain 2 life.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 2 },
      resolve: null,
      text: "Whenever equipped creature deals combat damage, put two charge counters on Umezawa's Jitte.",
    },
  ],
});
