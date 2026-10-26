import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 17201.

export default defineCard({
  name: "Glint-Eye Nephilim",
  manaCost: "{U}{B}{R}{G}",
  colors: ["U", "B", "R", "G"],
  types: ["creature"],
  subtypes: ["Nephilim"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature deals combat damage to a player, draw that many cards.\n{1}, Discard a card: This creature gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw that many cards.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}, Discard a card: This creature gets +1/+1 until end of turn.",
    },
  ],
});
