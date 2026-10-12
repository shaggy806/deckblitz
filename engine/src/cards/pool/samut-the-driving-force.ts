import { defineCard } from "../define.js";
import { START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 13008. Both X's are its controller's speed, read live (0 with
// none, rule 702.179f); the reduction takes off generic mana only.
const PUMP_TEXT = "Other creatures you control get +X/+0, where X is your speed.";
const COST_TEXT = "Noncreature spells you cast cost {X} less to cast, where X is your speed.";

export default defineCard({
  name: "Samut, the Driving Force",
  manaCost: "{3}{R}{G}{W}",
  colors: ["G", "R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Cleric"],
  power: 4,
  toughness: 5,
  keywords: ["first-strike", "vigilance", "haste", "start-your-engines"],
  text: `First strike, vigilance, haste\n${START_YOUR_ENGINES_TEXT}\n${PUMP_TEXT}\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPtPerCount: { speed: true, pt: [1, 0] },
      text: PUMP_TEXT,
    },
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, caster: "you", reduceGeneric: { speed: "you" } },
      text: COST_TEXT,
    },
  ],
});
