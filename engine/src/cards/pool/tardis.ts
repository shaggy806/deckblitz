import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// "You may planeswalk" does nothing outside a Planechase game (the ruling),
// and Planechase isn't played here.
const ATTACK_TEXT =
  "Whenever this Vehicle attacks, if you control a Time Lord, the next spell you cast this turn has cascade and you may planeswalk.";

export default defineCard({
  name: "TARDIS",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Time Lord" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        triggered: [{ trigger: { on: "this-cast" }, targets: [], effect: { kind: "cascade" }, resolve: null, text: "Cascade" }],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
