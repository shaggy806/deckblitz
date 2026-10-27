import { defineCard } from "../define.js";

export default defineCard({
  name: "Trap Digger",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 3,
  text: "{2}{W}, {T}: Put a trap counter on target land you control.\nSacrifice a land with a trap counter on it: This creature deals 3 damage to target attacking creature without flying.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: ["land-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "trap", amount: 1 },
      resolve: null,
      text: "{2}{W}, {T}: Put a trap counter on target land you control.",
    },
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: { filter: { type: "land", counters: { kind: "trap", compare: { op: "gte", n: 1 } } } },
      },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "Sacrifice a land with a trap counter on it: This creature deals 3 damage to target attacking creature without flying.",
    },
  ],
});
