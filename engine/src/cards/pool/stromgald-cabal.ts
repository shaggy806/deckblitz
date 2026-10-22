import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 20206.

export default defineCard({
  name: "Stromgald Cabal",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "{T}, Pay 1 life: Counter target white spell.",
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [{ kind: "spell", filter: { colors: ["W"] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{T}, Pay 1 life: Counter target white spell.",
    },
  ],
});
