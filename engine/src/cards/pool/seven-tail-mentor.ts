import { defineCard } from "../define.js";

// EDHREC rank 16974. Reputable Merchant's two triggers, with Roaring Earth's
// "creature or Vehicle you control" target (a noncreature Vehicle can take it).

const TEXT = "When this creature enters or dies, put a +1/+1 counter on target creature or Vehicle you control.";
const TARGET = {
  kind: "permanent",
  whose: "you",
  filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
} as const;

export default defineCard({
  name: "Seven-Tail Mentor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [TARGET],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [TARGET],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
