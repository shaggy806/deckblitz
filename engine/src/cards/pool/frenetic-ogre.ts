import { defineCard } from "../define.js";

// EDHREC rank 32020.

export default defineCard({
  name: "Frenetic Ogre",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 2,
  toughness: 3,
  text: "{R}, Discard a card at random: This creature gets +3/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, discard: { count: 1, random: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}, Discard a card at random: This creature gets +3/+0 until end of turn.",
    },
  ],
});
