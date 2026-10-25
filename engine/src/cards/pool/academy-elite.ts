import { defineCard } from "../define.js";

const ENTER_TEXT =
  "This creature enters with X +1/+1 counters on it, where X is the number of instant and sorcery cards in all graveyards.";
const LOOT_TEXT = "{2}{U}, Remove a +1/+1 counter from this creature: Draw a card, then discard a card.";

export default defineCard({
  name: "Academy Elite",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${LOOT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"] } } },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
