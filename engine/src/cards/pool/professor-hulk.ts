import { defineCard } from "../define.js";

// EDHREC rank 10054. Hunter's Prowess's trigger: "that many" is the damage
// dealt (the trigger value).

const TEXT = "Whenever Professor Hulk deals combat damage to a player, draw that many cards.";

export default defineCard({
  name: "Professor Hulk",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Scientist", "Hero"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
