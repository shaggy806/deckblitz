import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "This creature enters with a +1/+1 counter on it for each different mana cost among nonland cards in your graveyard. (For example, {2}{B} and {1}{B}{B} are different mana costs.)";

// A `distinct` aggregate of `"mana-cost"`: the symbols, not their total. A
// card with no mana cost adds nothing (rule 202.1b). Entering from your
// graveyard it still counts itself (rule 614.12).
export default defineCard({
  name: "Embodiment of Agonies",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 0,
  toughness: 0,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { aggregate: "distinct", of: "mana-cost", filter: { notTypes: ["land"], ownedBy: "you" }, in: "graveyards" },
        },
      },
      text: ENTERS_TEXT,
    },
  ],
});
