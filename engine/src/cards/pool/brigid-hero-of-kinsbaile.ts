import { defineCard } from "../define.js";

const TEXT = "{T}: Brigid deals 2 damage to each attacking or blocking creature target player controls.";

export default defineCard({
  name: "Brigid, Hero of Kinsbaile",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kithkin", "Archer"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] },
        amount: 2,
        controlledByTarget: 0,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
