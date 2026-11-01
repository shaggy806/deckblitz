import { defineCard } from "../define.js";

export default defineCard({
  name: "Elspeth Tirel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Elspeth"],
  loyalty: 4,
  text:
    "+2: You gain 1 life for each creature you control.\n" +
    "−2: Create three 1/1 white Soldier creature tokens.\n" +
    "−5: Destroy all other permanents except for lands and tokens.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: "+2: You gain 1 life for each creature you control.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 3 },
      resolve: null,
      text: "−2: Create three 1/1 white Soldier creature tokens.",
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "destroy-all", filter: { notTypes: ["land"], token: false }, exceptSource: true },
      resolve: null,
      text: "−5: Destroy all other permanents except for lands and tokens.",
    },
  ],
});
