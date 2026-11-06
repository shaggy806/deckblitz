import { defineCard } from "../define.js";


export default defineCard({
  name: "Cold-Blooded Crew",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Gorn", "Warrior"],
  power: 4,
  toughness: 4,
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "When this creature enters, put two +1/+1 counters on target creature.\nThis creature can't be blocked by creatures with power 2 or less.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "When this creature enters, put two +1/+1 counters on target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
