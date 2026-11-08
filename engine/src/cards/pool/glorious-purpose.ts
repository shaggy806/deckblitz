import { defineCard } from "../define.js";

const CONNIVES_TEXT =
  "Whenever a creature you control connives, put a +1/+1 counter on that creature and a plan counter on this enchantment.";
const PLAN_TEXT =
  "When the sixth plan counter is put on this enchantment, sacrifice it. If you do, exile the top four cards of your library. You may cast any number of spells from among them without paying their mana costs. Put the rest into your hand.";

// The generic connive trigger (`{ on: "event", event: "connives" }`, B278);
// Political Triumph's "the Nth plan counter"; Collected Conjuring's "put the
// exiled cards not cast this way" (`move-exiled-this-way`).
export default defineCard({
  name: "Glorious Purpose",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${CONNIVES_TEXT}\n${PLAN_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "connives", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: CONNIVES_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 6 },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "sequence",
          effects: [
            { kind: "exile-from-library", amount: 4 },
            { kind: "cast-now", from: "exiled-this-way", repeat: true, free: true },
            { kind: "move-exiled-this-way", to: "hand" },
          ],
        },
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
