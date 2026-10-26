import { defineCard } from "../define.js";

// EDHREC rank 27606.
// Makes Kithkin Soldier → use "Kithkin Soldier Token".

export default defineCard({
  name: "Guardian of Cloverdell",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 4,
  toughness: 5,
  text: "When this creature enters, create three 1/1 white Kithkin Soldier creature tokens.\n{G}, Sacrifice a Kithkin: You gain 1 life.",
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: { filter: { subtype: "Kithkin" } } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{G}, Sacrifice a Kithkin: You gain 1 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Soldier Token", count: 3 },
      resolve: null,
      text: "When this creature enters, create three 1/1 white Kithkin Soldier creature tokens.",
    },
  ],
});
