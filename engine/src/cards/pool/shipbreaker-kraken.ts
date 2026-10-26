import { defineCard } from "../define.js";

// EDHREC rank 8825. "For as long as you control this creature" is Merchant
// Raiders' `while-you-control-source` restriction: losing control of the
// Kraken, even before the trigger resolves, frees them (the rulings), and an
// already-tapped target is held all the same.
const MONSTROSITY_TEXT =
  "{6}{U}{U}: Monstrosity 4. (If this creature isn't monstrous, put four +1/+1 counters on it and it becomes monstrous.)";
const MONSTROUS_TEXT =
  "When this creature becomes monstrous, tap up to four target creatures. Those creatures don't untap during their controllers' untap steps for as long as you control this creature.";

export default defineCard({
  name: "Shipbreaker Kraken",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 6,
  toughness: 6,
  text: `${MONSTROSITY_TEXT}\n${MONSTROUS_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 4 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: 4 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-you-control-source" },
          ],
        },
      },
      resolve: null,
      text: MONSTROUS_TEXT,
    },
  ],
});
