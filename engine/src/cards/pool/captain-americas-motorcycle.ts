import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 28207. "Creature or Vehicle" reaches an uncrewed Vehicle — this
// one included.

const PUMP_TEXT = "When this Vehicle enters, target creature or Vehicle gets +2/+0 until end of turn.";

export default defineCard({
  name: "Captain America's Motorcycle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${PUMP_TEXT}\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(1)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
