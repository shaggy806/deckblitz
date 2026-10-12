import { defineCard } from "../define.js";

// EDHREC rank 17556. Marvel Super Heroes Commander.
//
// Sunblast Angel's enters wrath over Austere Command's artifact filter, and
// the must-attack restriction (Ashen Monstrosity).
const ENTER_TEXT = "When Hulk enters, destroy all artifacts.";
const ATTACK_TEXT = "Hulk attacks each combat if able.";

export default defineCard({
  name: "Hulk, Always Angry",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Berserker", "Hero"],
  power: 9,
  toughness: 9,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "artifact" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: ATTACK_TEXT,
    },
  ],
});
