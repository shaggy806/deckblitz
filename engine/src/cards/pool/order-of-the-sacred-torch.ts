import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 20631.

export default defineCard({
  name: "Order of the Sacred Torch",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "{T}, Pay 1 life: Counter target black spell.",
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [{ kind: "spell", filter: { colors: ["B"] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{T}, Pay 1 life: Counter target black spell.",
    },
  ],
});
