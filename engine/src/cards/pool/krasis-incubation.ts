import { defineCard } from "../define.js";

// Rulings:
//   [2013-04-15] Returning Krasis Incubation to its owner's hand is part of the cost to activate
//     its last ability. Once that ability is announced, players can't respond to it until after
//     you've paid its activation cost and returned Krasis Incubation to hand.

export default defineCard({
  name: "Krasis Incubation",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block, and its activated abilities can't be activated.\n{1}{G}{U}, Return this Aura to its owner's hand: Put two +1/+1 counters on enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{G}{U}", tap: false, returnSelfToHand: true },
      targets: [],
      // "Enchanted creature": the one it was last attached to (the Aura is gone by then).
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "{1}{G}{U}, Return this Aura to its owner's hand: Put two +1/+1 counters on enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
