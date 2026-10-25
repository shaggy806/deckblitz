import { defineCard } from "../define.js";

const ENTER_TEXT =
  "This creature enters with X +1/+1 counters on it, where X is the number of other creatures on the battlefield.";
const SPIRIT_TEXT = "{2}{W}, Remove a +1/+1 counter from this creature: Create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Custodi Soulbinders",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${SPIRIT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        // Every controller's creatures; what's entering with it isn't on the battlefield yet
        // (rule 614.12), and neither is this creature.
        counters: { kind: "+1/+1", amount: { countOf: { type: "creature" }, excludeSelf: true } },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: SPIRIT_TEXT,
    },
  ],
});
