import { defineCard } from "../define.js";

// EDHREC rank 12467.

export default defineCard({
  name: "Ferropede",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: "This creature can't be blocked.\nWhenever this creature deals combat damage to a player, you may remove a counter from target permanent.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["permanent"],
      effect: { kind: "remove-counters", target: 0, counter: "any", count: 1, upTo: true },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may remove a counter from target permanent.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
