import { defineCard } from "../define.js";

// "For as long as you control Lightning" is over for good the moment you don't,
// regaining control or not, and a Lightning that left and came back is a new
// object (the ruling; rules 400.7, 611.2b).
const TEXT =
  "Whenever Lightning deals combat damage to a player, exile the top card of your library. You may play that card for as long as you control Lightning.";

export default defineCard({
  name: "Lightning, Security Sergeant",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "while-you-control-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
