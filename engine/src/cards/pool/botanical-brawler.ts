import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more +1/+1 counters are put on another permanent you control, if it's the first time +1/+1 counters have been put on that permanent this turn, put a +1/+1 counter on this creature.";

// EDHREC rank 6954. The first-time count reads the whole turn, from before
// Botanical Brawler was there (its ruling).
export default defineCard({
  name: "Botanical Brawler",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\nThis creature enters with two +1/+1 counters on it.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "you-control", counter: "+1/+1", filter: { isSource: false }, firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
