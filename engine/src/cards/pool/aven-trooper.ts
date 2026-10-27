import { defineCard } from "../define.js";

export default defineCard({
  name: "Aven Trooper",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{2}{W}, Discard a card: This creature gets +1/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{W}, Discard a card: This creature gets +1/+2 until end of turn.",
    },
  ],
});
