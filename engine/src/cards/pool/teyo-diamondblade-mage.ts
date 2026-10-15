import { defineCard } from "../define.js";

// EDHREC rank 28940.
//
// Teyo, Lightshield Expert's shape. A permanent that's both a creature and a
// planeswalker as it resolves gets both counters (the ruling): two separate
// checks, not an either/or.
const ENTER_TEXT =
  "When Teyo enters, target permanent you control gains deathtouch until end of turn. Put a +1/+1 counter on it if it's a creature. Put a loyalty counter on it if it's a planeswalker.";

export default defineCard({
  name: "Teyo, Diamondblade Mage",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "planeswalker" } },
            then: { kind: "add-counter", target: 0, counter: "loyalty", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
