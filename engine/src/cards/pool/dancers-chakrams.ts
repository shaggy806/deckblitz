import { defineCard } from "../define.js";

const JOB =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const EQUIPPED =
  'Equipped creature gets +2/+2, has lifelink and "Other commanders you control get +2/+2 and have lifelink," and is a Performer in addition to its other types.';

export default defineCard({
  name: "Dancer's Chakrams",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB}\n${EQUIPPED}\nKrishna — Equip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: JOB,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["lifelink"],
      addSubtypes: ["Performer"],
      // Whether or not the equipped creature is a commander itself (the ruling).
      grantsStatic: [
        {
          affects: { scope: "filter", filter: { isCommander: true, controlledBy: "you" }, excludeSelf: true },
          grantPt: [2, 2],
          grantKeywords: ["lifelink"],
          text: "Other commanders you control get +2/+2 and have lifelink.",
        },
      ],
      text: EQUIPPED,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: "Krishna — Equip {3}",
    },
  ],
});
