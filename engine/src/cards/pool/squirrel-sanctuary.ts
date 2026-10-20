import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). The return works only while the enchantment is on
// the battlefield (the ruling) — a battlefield trigger, as every one is by
// default.
const ENTER_TEXT = "When this enchantment enters, create a 1/1 green Squirrel creature token.";
const DIES_TEXT =
  "Whenever a nontoken creature you control dies, you may pay {1}. If you do, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Squirrel Sanctuary",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to return Squirrel Sanctuary to its owner's hand?",
        cost: "{1}",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
