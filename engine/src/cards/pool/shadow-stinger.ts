import { defineCard } from "../define.js";

// Ruling: any other untapped Rogue you control may be tapped for the cost,
// one that came under your control this turn included.

const TAP = "Tap another untapped Rogue you control: This creature gains deathtouch until end of turn.";
const HIT = "Whenever this creature deals combat damage to a player, that player mills three cards.";

export default defineCard({
  name: "Shadow Stinger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 1,
  toughness: 4,
  text: `${TAP}\n${HIT} (They put the top three cards of their library into their graveyard.)`,
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { subtype: "Rogue", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: TAP,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: 3 },
      resolve: null,
      text: HIT,
    },
  ],
});
