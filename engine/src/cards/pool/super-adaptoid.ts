import type { EffectSpec } from "../../effects.js";
import { defineCard, type Keyword } from "../define.js";

// EDHREC rank 13879. Marvel Super Heroes.
//
// Its power is a characteristic-defining ability (rule 604.3) counting
// itself, a legendary creature (Adeline's shape). "Enters or attacks" is one
// ability with two trigger events, authored as two. Each keyword is its own
// check as the ability resolves, in printed order: the target has it (as it
// is then, granted keywords included) and Super-Adaptoid doesn't — then a
// keyword counter of that kind goes on Super-Adaptoid (rule 122.1b). One
// target, so if it's gone nothing happens.
const POWER_TEXT = "Super-Adaptoid's power is equal to the number of legendary creatures you control.";
const ADAPT_TEXT =
  "Whenever Super-Adaptoid enters or attacks, choose another target creature. If that creature has haste and Super-Adaptoid doesn't, put a haste counter on Super-Adaptoid. Do the same for flying, first strike, double strike, deathtouch, indestructible, lifelink, menace, reach, trample, and vigilance.";

const KEYWORDS: readonly Keyword[] = [
  "haste",
  "flying",
  "first-strike",
  "double-strike",
  "deathtouch",
  "indestructible",
  "lifelink",
  "menace",
  "reach",
  "trample",
  "vigilance",
];

const ADAPT: EffectSpec = {
  kind: "sequence",
  effects: KEYWORDS.map(
    (keyword): EffectSpec => ({
      kind: "conditional",
      condition: {
        kind: "all",
        of: [
          { kind: "target", index: 0, filter: { keyword } },
          { kind: "not", of: { kind: "source", filter: { keyword } } },
        ],
      },
      then: { kind: "add-counter", target: "source", counter: keyword, amount: 1 },
    }),
  ),
};

export default defineCard({
  name: "Super-Adaptoid",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 0,
  toughness: 2,
  text: `${POWER_TEXT}\n${ADAPT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", supertype: "legendary", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: ADAPT,
      resolve: null,
      text: ADAPT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: ADAPT,
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
});
