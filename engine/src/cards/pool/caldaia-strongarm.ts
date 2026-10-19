import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, put two +1/+1 counters on target creature.";
const BLITZ_TEXT =
  'Blitz {3}{G} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Caldaia Strongarm",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{3}{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
