import { defineCard } from "../define.js";

const STATIC_TEXT =
  "As long as there are five or more mana values among cards in your graveyard, this creature gets +2/+2 and has deathtouch.";
const DIES_TEXT = "When this creature dies, mill two cards, then draw a card.";

// "Five or more mana values": the different mana values among the cards in
// your graveyard, a land's 0 among them.
export default defineCard({
  name: "Aven Heartstabber",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Bird", "Assassin"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${STATIC_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "aggregate",
        value: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
        compare: { op: "gte", n: 5 },
      },
      grantPt: [2, 2],
      grantKeywords: ["deathtouch"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
