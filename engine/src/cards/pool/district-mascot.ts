import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle } from "../helpers.js";

const ENTER_TEXT = "This creature enters with a +1/+1 counter on it.";
const DESTROY_TEXT = "{1}{G}, Remove two +1/+1 counters from this creature: Destroy target artifact.";
const ATTACK_TEXT = "Whenever this creature attacks while saddled, put a +1/+1 counter on it.";

export default defineCard({
  name: "District Mascot",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Mount"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${DESTROY_TEXT}\n${ATTACK_TEXT}\nSaddle 1`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, removeCounter: { kind: "+1/+1", count: 2 } },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
    saddle(1),
  ],
});
