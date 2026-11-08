import { defineCard } from "../define.js";

// Rulings:
//   If an exhaust ability of a permanent is activated, and then that permanent leaves the battlefield
//     and returns, it becomes a new object so its exhaust ability can be activated again.

const ATTACK_TEXT = "Whenever one or more creatures attack you, those creatures get -1/-0 until end of turn.";
const EXHAUST_TEXT = "Exhaust — {5}{U}{U}: Put three +1/+1 counters on this creature.";

export default defineCard({
  name: "Sabotage Strategist",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Ranger"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ATTACK_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "you" },
      targets: [],
      effect: { kind: "modify-pt-all", filter: { inSet: "trigger-batch" }, power: -1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      resolve: null,
      exhaust: true,
      text: EXHAUST_TEXT,
    },
  ],
});
