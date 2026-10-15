import { defineCard } from "../define.js";

// EDHREC rank 29925.

const PROWESS_TEXT =
  "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const ANTHEM_TEXT = "As long as Patriot is equipped, other creatures you control get +1/+0.";

export default defineCard({
  name: "Patriot, Young Avenger",
  manaCost: "{2}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 2,
  text: `${PROWESS_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
});
