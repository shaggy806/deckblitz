import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 25503.
//
// Rulings:
//   [2022-02-18] If you don't control both an artifact and an enchantment at the moment Kami of
//     Terrible Secrets enters the battlefield, its ability won't trigger at all. If the ability
//     triggers, it will check again as it tries to resolve. If you don't control both at that
//     time, the ability won't do anything.
//   [2022-02-18] The artifact and the enchantment may be the same permanent.
//
// An intervening-if (asked as it triggers and as it resolves) of two separate `controls`
// clauses, so one artifact enchantment answers both.
const TEXT =
  "When this creature enters, if you control an artifact and an enchantment, you draw a card and you gain 1 life.";

export default defineCard({
  name: "Kami of Terrible Secrets",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
          { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
        ],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
