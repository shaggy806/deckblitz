import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 15277. Sachi is a Shaman herself, so
// she has the granted mana ability too.
const SNAKES = "Other Snake creatures you control get +0/+1.";
const SHAMANS = 'Shamans you control have "{T}: Add {G}{G}."';

export default defineCard({
  name: "Sachi, Daughter of Seshiro",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 1,
  toughness: 3,
  text: `${SNAKES}\n${SHAMANS}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Snake" },
      grantPt: [0, 1],
      text: SNAKES,
    },
    {
      affects: { scope: "creatures-you-control", subtype: "Shaman" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "G", amount: 2 },
          resolve: null,
          text: "{T}: Add {G}{G}.",
        },
      ],
      text: SHAMANS,
    },
  ],
});
