import { defineCard } from "../define.js";

const STRIKE_TEXT = "Equipped creature has first strike.";
const HUMAN_TEXT = "As long as equipped creature is a Human, it gets +1/+1.";

export default defineCard({
  name: "Sharpened Pitchfork",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STRIKE_TEXT}\n${HUMAN_TEXT}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantKeywords: ["first-strike"], text: STRIKE_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Human" } } },
      grantPt: [1, 1],
      text: HUMAN_TEXT,
    },
  ],
});
