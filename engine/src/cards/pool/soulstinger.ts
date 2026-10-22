import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, put two -1/-1 counters on target creature you control.";
const DIES_TEXT =
  "When this creature dies, you may put a -1/-1 counter on target creature for each -1/-1 counter on this creature.";

export default defineCard({
  name: "Soulstinger",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Scorpion", "Demon"],
  power: 4,
  toughness: 5,
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      // The counters it died with (last-known information) — all on the one target.
      effect: {
        kind: "may",
        prompt: "Put a -1/-1 counter on target creature for each -1/-1 counter on Soulstinger?",
        effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: { countersOn: "source", counter: "-1/-1" } },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
