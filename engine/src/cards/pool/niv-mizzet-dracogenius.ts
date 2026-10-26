import { defineCard } from "../define.js";

// EDHREC rank 9353. Return to Ravnica.
//
// "Deals damage to a player" is any damage, combat or not (`deals-damage` to
// a player) — so its own pinging ability draws too.

const TRIGGER_TEXT = "Whenever Niv-Mizzet deals damage to a player, you may draw a card.";
const PING_TEXT = "{U}{R}: Niv-Mizzet deals 1 damage to any target.";

export default defineCard({
  name: "Niv-Mizzet, Dracogenius",
  manaCost: "{2}{U}{U}{R}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{U}{R}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
