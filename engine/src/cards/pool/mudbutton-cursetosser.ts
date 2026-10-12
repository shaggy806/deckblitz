import { defineCard } from "../define.js";

// EDHREC rank 18380.
//
// "Behold a Goblin or pay {2}": a choice of whole costs (rule 601.2b),
// beholding offered only with a Goblin to reveal from the hand or choose on
// the battlefield (701.4a).

export default defineCard({
  name: "Mudbutton Cursetosser",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 2,
  toughness: 1,
  additionalCost: {
    options: [
      { text: "Behold a Goblin", behold: { filter: { subtype: "Goblin" }, text: "a Goblin" } },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  text: "As an additional cost to cast this spell, behold a Goblin or pay {2}. (To behold a Goblin, choose a Goblin you control or reveal a Goblin card from your hand.)\nThis creature can't block.\nWhen this creature dies, destroy target creature an opponent controls with power 2 or less.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", power: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature dies, destroy target creature an opponent controls with power 2 or less.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
