import { defineCard } from "../define.js";

// EDHREC rank 20702. Reality Fracture.
//
// Rulings:
//   [2026-08-21] If the target permanent is somehow both a creature and a planeswalker as Teyo's
//     last ability resolves, it will get both kinds of counters.
//
// Forge of Heroes' shape: each counter's type check reads the target as the
// ability resolves, so a creature planeswalker gets both.

const ENTER_TEXT =
  "When Teyo enters, target permanent you control gains hexproof until end of turn. Put a +1/+1 counter on it if it's a creature. " +
  "Put a loyalty counter on it if it's a planeswalker.";

export default defineCard({
  name: "Teyo, Lightshield Expert",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT} (It can't be the target of spells or abilities your opponents control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
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
