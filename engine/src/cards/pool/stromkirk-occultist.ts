import { defineCard } from "../define.js";

const IMPULSE_TEXT =
  "Whenever this creature deals combat damage to a player, exile the top card of your library. Until end of turn, you may play that card.";

export default defineCard({
  name: "Stromkirk Occultist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Horror"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  madness: { cost: "{1}{R}" },
  text: `Trample\n${IMPULSE_TEXT}\nMadness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: IMPULSE_TEXT,
    },
  ],
});
