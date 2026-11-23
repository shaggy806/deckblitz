import { defineCard } from "../define.js";

const ENTER_TEXT = "This creature enters with two cage counters on it.";
const CAGE_TEXT = "This creature can't attack or block as long as it has a cage counter on it.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, remove a cage counter from this creature. When the last cage counter is removed this way, destroy target creature an opponent controls.";

const removeOne = { kind: "remove-counter", target: "source", counter: "cage", amount: 1 } as const;

export default defineCard({
  name: "Seer of the Bright Side",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${CAGE_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // "The last cage counter is removed this way": this removal takes the
      // only one left — read before it, with the creature still here to lose
      // it. With more than one, it just removes one; with none, nothing.
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "source", filter: { counters: { kind: "cage", compare: { op: "eq", n: 1 } } } },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            removeOne,
            {
              kind: "reflexive-trigger",
              targets: ["creature-an-opponent-controls"],
              effect: { kind: "destroy", target: 0 },
              text: "When the last cage counter is removed this way, destroy target creature an opponent controls.",
            },
          ],
        },
        else: removeOne,
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "cage", amount: 2 } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "cage", compare: { op: "gte", n: 1 } } } },
      restrictions: ["cant-attack", "cant-block"],
      text: CAGE_TEXT,
    },
  ],
});
