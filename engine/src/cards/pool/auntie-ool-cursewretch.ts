import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const COUNTERS_TEXT =
  "Whenever one or more -1/-1 counters are put on a creature, draw a card if you control that creature. If you don't control it, its controller loses 1 life.";

export default defineCard({
  name: "Auntie Ool, Cursewretch",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 4,
  toughness: 4,
  text: `Ward—Blight 2. (To blight 2, a player puts two -1/-1 counters on a creature they control.)\n${COUNTERS_TEXT}`,
  triggered: [
    ward({ blight: 2 }),
    {
      // Once per creature per event, whoever put them. "That creature" is the
      // trigger object, its controller read as it resolves (or as it last
      // was, if it has died of them).
      trigger: { on: "counters-put", who: "any", counter: "-1/-1", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { controlledBy: "you" } },
        then: { kind: "draw", amount: 1 },
        else: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
