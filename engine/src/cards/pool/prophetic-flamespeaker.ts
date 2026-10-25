import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals combat damage to a player, exile the top card of your library. You may play it this turn.";

export default defineCard({
  name: "Prophetic Flamespeaker",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 3,
  keywords: ["double-strike", "trample"],
  text: `Double strike, trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
