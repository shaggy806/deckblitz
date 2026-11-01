import { defineCard } from "../define.js";

// EDHREC rank 27270. The sacrifice cost's "a creature of the chosen type" reads this
// artifact's choice (`ofChosenType`, matched against the source); with no
// type chosen nothing pays it.

const CHOOSE = "As this artifact enters, choose a creature type.";
const TEXT = "{3}, {T}, Sacrifice a creature of the chosen type: This artifact deals 3 damage to any target.";

export default defineCard({
  name: "Doom Cannon",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  chooseCreatureTypeOnEnter: true,
  text: `${CHOOSE}\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: { filter: { type: "creature", ofChosenType: true } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
