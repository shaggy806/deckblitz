import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 17068.
// Rulings: compared power to power and toughness to toughness when it
// triggers and again as it resolves (an intervening if — rule 603.4), the
// entering creature by its last-known P/T if it has left; several entering
// together trigger it once each, each compared as it resolves. Hulkling,
// Burgeoning Bruiser's shape.

const GROW_TEXT =
  "Whenever another creature you control enters, if that creature has greater power or toughness than this creature, put an oil counter on this creature.";

const BIGGER: CardFilter = {
  type: "creature",
  anyOf: [
    { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
    { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
  ],
};

export default defineCard({
  name: "Evolving Adaptive",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 0,
  toughness: 0,
  text: `This creature enters with an oil counter on it.\nThis creature gets +1/+1 for each oil counter on it.\n${GROW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 1 } },
      text: "This creature enters with an oil counter on it.",
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { countersOnSource: "oil", pt: [1, 1] },
      text: "This creature gets +1/+1 for each oil counter on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: BIGGER, otherOnly: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: BIGGER },
        then: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
