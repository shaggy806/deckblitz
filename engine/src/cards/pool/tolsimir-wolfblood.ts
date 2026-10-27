import { defineCard } from "../define.js";

const VOJA = "{T}: Create Voja, a legendary 2/2 green and white Wolf creature token.";

export default defineCard({
  name: "Tolsimir Wolfblood",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 4,
  text: `Other green creatures you control get +1/+1.\nOther white creatures you control get +1/+1.\n${VOJA}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other green creatures you control get +1/+1.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other white creatures you control get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Voja", count: 1 },
      resolve: null,
      text: VOJA,
    },
  ],
});
