import { defineCard } from "../define.js";

// EDHREC rank 14830. Wilds of Eldraine (Commander-legal first printing).
// God-Eternal Bontu's "sacrifice any number …, then draw that many cards",
// narrowed to artifacts, enchantments and tokens: chosen as the trigger
// resolves, zero allowed, sacrificed as one event, and whatever triggers on
// the sacrifices waits until the cards are drawn (its rulings).
const ENTER_TEXT =
  "When this creature enters, sacrifice any number of artifacts, enchantments, and/or tokens, then draw that many cards.";

const SACRIFICEABLE = {
  controlledBy: "you",
  anyOf: [{ type: "artifact" }, { type: "enchantment" }, { token: true }],
} as const;

export default defineCard({
  name: "Malevolent Witchkite",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon", "Warlock"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: SACRIFICEABLE,
            upTo: { countOf: SACRIFICEABLE },
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of artifacts, enchantments, and/or tokens",
          },
          { kind: "draw", amount: { thisWay: "sacrificed" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
