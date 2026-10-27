import { defineCard } from "../define.js";

export default defineCard({
  name: "Tolarian Sentinel",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{U}, {T}, Discard a card: Return target permanent you control to its owner's hand.",
  activated: [
    {
      cost: { mana: "{U}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{U}, {T}, Discard a card: Return target permanent you control to its owner's hand.",
    },
  ],
});
