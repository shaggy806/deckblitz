import { defineCard } from "../define.js";

// EDHREC rank 8667.

export default defineCard({
  name: "Nemata, Grove Guardian",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 5,
  text: "{2}{G}: Create a 1/1 green Saproling creature token.\nSacrifice a Saproling: Saproling creatures get +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: "{2}{G}: Create a 1/1 green Saproling creature token.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Saproling" } } },
      targets: [],
      // Every Saproling creature, whoever controls it.
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Saproling" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice a Saproling: Saproling creatures get +1/+1 until end of turn.",
    },
  ],
});
