import { defineCard } from "../define.js";

export default defineCard({
  name: "Pyxis of Pandemonium",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Each player exiles the top card of their library face down.\n{7}, {T}, Sacrifice this artifact: Each player turns face up all cards they own exiled with this artifact, then puts all permanent cards among them onto the battlefield.",
  activated: [
    {
      cost: { mana: null, tap: true },
      resolve: null,
      text: "{T}: Each player exiles the top card of their library face down.",
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-player", amount: 1, faceDown: true, linked: true },
    },
    {
      cost: { mana: "{7}", tap: true, sacrifice: "self" },
      resolve: null,
      text: "{7}, {T}, Sacrifice this artifact: Each player turns face up all cards they own exiled with this artifact, then puts all permanent cards among them onto the battlefield.",
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "turn-exiled-face-up" },
          {
            kind: "return-exiled-by-source",
            linked: "battlefield",
            filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
          },
        ],
      },
    },
  ],
});
