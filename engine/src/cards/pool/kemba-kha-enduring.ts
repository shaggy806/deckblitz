import { defineCard } from "../define.js";

// EDHREC rank 11642.
// Makes Cat → use "Cat Token".
//
// "Whenever Kemba or another Cat you control enters" is two triggers — Kemba herself (whatever her
// types are as she enters) and another Cat — so a Kemba that isn't a Cat still triggers. The
// Equipment goes onto "that creature": Kemba (`source`) or the Cat that entered (`trigger-object`).

const ATTACH_TEXT =
  "Whenever Kemba or another Cat you control enters, attach up to one target Equipment you control to that creature.";
const ANTHEM_TEXT = "Equipped creatures you control get +1/+1.";
const CAT_TEXT = "{3}{W}{W}: Create a 2/2 white Cat creature token.";

const EQUIPMENT_YOU_CONTROL = {
  kind: "optional",
  of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } },
} as const;

export default defineCard({
  name: "Kemba, Kha Enduring",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${ATTACH_TEXT}\n${ANTHEM_TEXT}\n${CAT_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Cat Token", count: 1 },
      resolve: null,
      text: CAT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [EQUIPMENT_YOU_CONTROL],
      effect: { kind: "attach", target: "source", attachment: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cat" }, otherOnly: true },
      targets: [EQUIPMENT_YOU_CONTROL],
      effect: { kind: "attach", target: "trigger-object", attachment: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
