import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

const GROW_TEXT =
  "Whenever another creature you control enters, if it has greater power or toughness than Hulkling, put a +1/+1 counter on Hulkling.";

// Evolve's shape (the `evolve` helper, rule 702.100a), with "another": an
// intervening-if (rule 603.4), so it's checked as the creature enters (the
// trigger's filter) and again as the ability resolves (the `conditional`).
// Power is compared with power and toughness with toughness.
const BIGGER: CardFilter = {
  type: "creature",
  anyOf: [
    { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
    { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
  ],
};

export default defineCard({
  name: "Hulkling, Burgeoning Bruiser",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kree", "Skrull", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${GROW_TEXT}`,
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
});
