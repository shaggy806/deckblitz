import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 28971. Crackling Triton's and Aurora
// Eidolon's abilities, for one mana each.

const RED_TEXT = "{R}, Sacrifice this creature: It deals 2 damage to any target.";
const WHITE_TEXT =
  "{W}, Sacrifice this creature: Prevent the next 2 damage that would be dealt to any target this turn.";

export default defineCard({
  name: "Goblin Legionnaire",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${RED_TEXT}\n${WHITE_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: RED_TEXT,
    },
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: WHITE_TEXT,
    },
  ],
});
