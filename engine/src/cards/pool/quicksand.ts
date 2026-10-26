import { defineCard } from "../define.js";

export default defineCard({
  name: "Quicksand",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{T}, Sacrifice this land: Target attacking creature without flying gets -1/-2 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{T}, Sacrifice this land: Target attacking creature without flying gets -1/-2 until end of turn.",
    },
  ],
});
