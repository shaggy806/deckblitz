import { defineCard } from "../define.js";

export default defineCard({
  name: "Gateway Sneak",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Rogue"],
  power: 1,
  toughness: 3,
  text: "Whenever a Gate you control enters, this creature can't be blocked this turn.\nWhenever this creature deals combat damage to a player, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Gate" } },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever a Gate you control enters, this creature can't be blocked this turn.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw a card.",
    },
  ],
});
