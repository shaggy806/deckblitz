import { defineCard } from "../define.js";

// EDHREC rank 3632.

const ENTER_TEXT = "This creature enters with X +1/+1 counters on it.";
const BLOCK_TEXT = "This creature can't be blocked by more than one creature.";
const DAMAGE_TEXT = "Whenever this creature is dealt damage, put that many +1/+1 counters on it.";

export default defineCard({
  name: "Hungering Hydra",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${BLOCK_TEXT}\nWhenever this creature is dealt damage, put that many +1/+1 counters on it. (It must survive the damage to get the counters.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTER_TEXT,
    },
    { affects: { scope: "self" }, blockedByAtMostOne: true, text: BLOCK_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
