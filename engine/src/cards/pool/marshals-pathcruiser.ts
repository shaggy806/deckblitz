import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 26519. The exhaust is Rocketeer Boostbuggy's: an artifact
// creature for as long as it stays on the battlefield, no crew needed.

const ETB_TEXT =
  "When this Vehicle enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const EXHAUST_TEXT = "Exhaust — {W}{U}{B}{R}{G}: This Vehicle becomes an artifact creature. Put two +1/+1 counters on it.";

export default defineCard({
  name: "Marshals' Pathcruiser",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 5,
  text: `${ETB_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)\nCrew 5`,
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "permanent" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
    crew(5),
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
