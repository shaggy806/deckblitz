import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 18869.
//
// Each player, in turn order, chooses whether to scry 1 (the ruling).
const TEXT = "When this creature enters, each player may scry 1.";

export default defineCard({
  name: "Eager Construct",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (To scry 1, look at the top card of your library, then you may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "each-player-may", who: "each-player", prompt: "Scry 1?", effect: { kind: "scry", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
