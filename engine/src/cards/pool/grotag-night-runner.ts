import { defineCard } from "../define.js";

const HIT =
  "Whenever this creature deals combat damage to a player, exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Grotag Night-Runner",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 3,
  text: HIT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: HIT,
    },
  ],
});
