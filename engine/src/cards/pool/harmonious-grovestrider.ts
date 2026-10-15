import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 15044.
//
// A characteristic-defining ability (rule 604.3), so it works in every zone
// (the ruling) — Beanstalk Giant's shape.

const PT_TEXT = "Harmonious Grovestrider's power and toughness are each equal to the number of lands you control.";

export default defineCard({
  name: "Harmonious Grovestrider",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  text: `Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${PT_TEXT}`,
  triggered: [ward({ mana: "{2}" })],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
