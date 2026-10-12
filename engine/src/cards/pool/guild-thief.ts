import { defineCard } from "../define.js";

export default defineCard({
  name: "Guild Thief",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Orc", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.\nCunning Action — {3}{U}: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Cunning Action — {3}{U}: This creature can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
    },
  ],
});
