import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 27233.

const ENTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const REGEN_TEXT = "{1}{G}: Regenerate this creature.";

export default defineCard({
  name: "Krakilin",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${REGEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
});
