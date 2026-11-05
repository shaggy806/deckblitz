import { defineCard } from "../define.js";

const CDA = "Fungal Behemoth's power and toughness are each equal to the number of +1/+1 counters on creatures you control.";
const COUNTER =
  "Whenever a time counter is removed from this card while it's exiled, you may put a +1/+1 counter on target creature.";

/** Suspend X (`n: "x"`): X announced with the action, at least 1. */
export default defineCard({
  name: "Fungal Behemoth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 0,
  toughness: 0,
  suspend: { n: "x", cost: "{X}{G}{G}" },
  text: `${CDA}\nSuspend X—{X}{G}{G}. X can't be 0. (Rather than cast this card from your hand, you may pay {X}{G}{G} and exile it with X time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)\n${COUNTER}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "sum", of: { counters: "+1/+1" }, filter: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "time" },
      whileSuspended: true,
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on target creature?",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: COUNTER,
    },
  ],
});
