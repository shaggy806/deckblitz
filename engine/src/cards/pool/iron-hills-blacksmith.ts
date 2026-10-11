import { defineCard } from "../define.js";

// EDHREC rank 11719.
const ETB_TEXT =
  'When this creature enters, create a colorless Equipment artifact token named Axe with "Equipped creature gets +1/+0" and equip {2}.';

export default defineCard({
  name: "Iron Hills Blacksmith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: `Double strike\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Axe Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
