import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this enchantment enters, create a 2/1 green Spider creature token with reach, then you gain 1 life for each Spider you control.";
const ANTHEM_TEXT = "Spiders you control get +1/+1 and can't be blocked by creatures with defender.";

export default defineCard({
  name: "Wall Crawl",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "2/1 Green Spider Token (Reach)", count: 1 },
          // Counted after the token is made ("then"), so it counts the new one.
          { kind: "gain-life", amount: { countOf: { subtype: "Spider", controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      // "Spiders you control" — permanents with the type (The Swarmweaver's scope).
      affects: { scope: "filter", filter: { subtype: "Spider", controlledBy: "you" } },
      grantPt: [1, 1],
      cantBeBlockedBy: { type: "creature", keyword: "defender" },
      text: ANTHEM_TEXT,
    },
  ],
});
