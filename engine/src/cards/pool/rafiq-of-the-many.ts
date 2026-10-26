import { defineCard } from "../define.js";

// EDHREC rank 10939.

const DOUBLE = "Whenever a creature you control attacks alone, it gains double strike until end of turn.";

export default defineCard({
  name: "Rafiq of the Many",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n${DOUBLE}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Exalted",
    },
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: DOUBLE,
    },
  ],
});
