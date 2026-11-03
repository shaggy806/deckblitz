import { defineCard } from "../define.js";

const CDA_TEXT = "Benalish Commander's power and toughness are each equal to the number of Soldiers you control.";
const SOLDIER_TEXT = "Whenever a time counter is removed from this card while it's exiled, create a 1/1 white Soldier creature token.";

/** Suspend X (`n: "x"`): X announced with the action, at least 1. */
export default defineCard({
  name: "Benalish Commander",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 0,
  toughness: 0,
  text: `${CDA_TEXT}\nSuspend X—{X}{W}{W}. X can't be 0.\n${SOLDIER_TEXT}`,
  suspend: { n: "x", cost: "{X}{W}{W}" },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { subtype: "Soldier", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "time" },
      whileSuspended: true,
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: SOLDIER_TEXT,
    },
  ],
});
