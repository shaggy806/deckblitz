import { defineCard } from "../define.js";

const FLASH_TEXT = "You may cast creature spells as though they had flash.";
// A leaves-the-battlefield trigger looks back (rule 603.10a), so it triggers
// when Sally leaves together with the other creatures (the ruling).
const LEAVE_TEXT =
  "Whenever one or more other creatures you control leave the battlefield, investigate. This ability triggers only once each turn. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Sally Sparrow",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 3,
  text: `${FLASH_TEXT}\n${LEAVE_TEXT}`,
  static: [{ affects: { scope: "self" }, castAsThoughFlash: { type: "creature" }, text: FLASH_TEXT }],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
