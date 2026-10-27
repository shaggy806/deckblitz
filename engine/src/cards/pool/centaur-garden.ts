import { defineCard } from "../define.js";

export default defineCard({
  name: "Centaur Garden",
  colors: [],
  types: ["land"],
  text: "{T}: Add {G}. This land deals 1 damage to you.\nThreshold — {G}, {T}, Sacrifice this land: Target creature gets +3/+3 until end of turn. Activate only if there are seven or more cards in your graveyard.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1, painToController: 1 },
      resolve: null,
      text: "{T}: Add {G}. This land deals 1 damage to you.",
    },
    {
      cost: { mana: "{G}", tap: true, sacrifice: "self" },
      condition: { kind: "threshold" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "Threshold — {G}, {T}, Sacrifice this land: Target creature gets +3/+3 until end of turn. Activate only if there are seven or more cards in your graveyard.",
    },
  ],
});
