import { defineCard } from "../define.js";

const ENTERS_TEXT = "This creature enters with a +1/+1 counter on it.";
const PING_TEXT = "{1}, Remove a +1/+1 counter from this creature: It deals 1 damage to any target.";

export default defineCard({
  name: "Monoskelion",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${PING_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTERS_TEXT,
    },
  ],
});
