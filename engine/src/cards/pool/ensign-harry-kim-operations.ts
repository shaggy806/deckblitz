import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

const GROW_TEXT =
  "Whenever another creature you control enters, if it has greater power than Ensign Kim, put a +1/+1 counter on Ensign Kim.";
const DRAW_TEXT = "{2}, Remove two +1/+1 counters from among creatures you control: Draw a card.";

const BIGGER: CardFilter = { type: "creature", power: { op: "gt", n: { amount: { powerOf: "source" } } } };

export default defineCard({
  name: "Ensign Harry Kim, Operations",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 1,
  toughness: 2,
  text: `${GROW_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: BIGGER, otherOnly: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: BIGGER },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 2, from: { type: "creature" }, among: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
