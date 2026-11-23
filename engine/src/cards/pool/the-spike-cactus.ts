import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Not cast, no mana was spent: it enters
// with none and dies a 0/0.

const ENTERS_TEXT =
  "The Spike Cactus enters the battlefield with +1/+1 counters on it equal to the amount of mana spent to cast it.";
const MOVE_TEXT = "{2}, Remove a +1/+1 counter from The Spike Cactus: Put a +1/+1 counter on target creature.";

export default defineCard({
  name: "The Spike Cactus",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spike"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${MOVE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { manaSpentOf: "source" } } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: MOVE_TEXT,
    },
  ],
});
