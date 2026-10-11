import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const COUNTER_TEXT = "Whenever Bifur enters or attacks, put a +1/+1 counter on target creature.";
const DOUBLE_TEXT =
  "As long as you have an enduring story, if a triggered ability of a Dwarf you control triggers, that ability triggers an additional time.";

export default defineCard({
  name: "Bifur, Melodic Rider",
  manaCost: "{4}{R/W}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 4,
  toughness: 5,
  keywords: ["storied"],
  text: `${STORIED_TEXT}\n${COUNTER_TEXT}\n${DOUBLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  static: [
    {
      // Katara, the Fearless's shape: keyed on whose ability it is.
      affects: { scope: "self" },
      condition: { kind: "enduring-story" },
      doubleTriggersOf: { filter: { subtype: "Dwarf", controlledBy: "you" } },
      text: DOUBLE_TEXT,
    },
  ],
});
