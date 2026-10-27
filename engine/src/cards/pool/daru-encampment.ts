import { defineCard } from "../define.js";

// EDHREC rank 19167.

export default defineCard({
  name: "Daru Encampment",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{W}, {T}: Target Soldier creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Soldier" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{W}, {T}: Target Soldier creature gets +1/+1 until end of turn.",
    },
  ],
});
