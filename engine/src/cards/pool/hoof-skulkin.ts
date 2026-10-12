import { defineCard } from "../define.js";

export default defineCard({
  name: "Hoof Skulkin",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  text: "{3}: Target green creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{3}: Target green creature gets +1/+1 until end of turn.",
    },
  ],
});
