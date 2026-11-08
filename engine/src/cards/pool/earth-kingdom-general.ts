import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this creature enters, earthbend 2. (Target land you control becomes a 0/0 creature with haste that's still a land. Put two +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)";
const COUNTERS_TEXT =
  "Whenever you put one or more +1/+1 counters on a creature, you may gain that much life. Do this only once each turn.";

// "Do this only once each turn" (rule 603.2h, B278): once the life is gained,
// the ability doesn't trigger again that turn (its ruling).
export default defineCard({
  name: "Earth Kingdom General",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${COUNTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "any", filter: { type: "creature" }, counter: "+1/+1", byYou: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Gain that much life?",
        oncePerTurn: true,
        effect: { kind: "gain-life", amount: { triggerValue: true } },
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
