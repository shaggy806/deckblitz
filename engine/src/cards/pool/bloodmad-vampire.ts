import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.";

export default defineCard({
  name: "Bloodmad Vampire",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Berserker"],
  power: 4,
  toughness: 1,
  madness: { cost: "{1}{R}" },
  text: `${TEXT}\nMadness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
