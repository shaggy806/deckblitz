import { defineCard } from "../define.js";

// EDHREC rank 8534.
//
// "If it's not a Vehicle" is read as the ability resolves: a Vehicle only
// becomes an artifact creature with flying (keeping its printed P/T, rule
// 301.7b); anything else is also a 1/1 base until end of turn (layer 7b).
// The upkeep counters may go on anyone's noncreature artifacts.

const ANIMATE_TEXT =
  "{2}{U}: Until end of turn, target noncreature artifact you control becomes an artifact creature and gains flying. If it's not a Vehicle, it has base power and toughness 1/1 until end of turn.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, put a +1/+1 counter on each of up to three target noncreature artifacts.";

export default defineCard({
  name: "Katsumasa, the Animator",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Artificer"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ANIMATE_TEXT}\n${UPKEEP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Vehicle" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          ],
        },
        else: {
          kind: "animate",
          target: 0,
          power: 1,
          toughness: 1,
          addTypes: ["artifact", "creature"],
          addSubtypes: [],
          keywords: ["flying"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", whose: "any", filter: { type: "artifact", notTypes: ["creature"] } },
          max: 3,
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
