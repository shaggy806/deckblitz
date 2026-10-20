import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";
import type { Keyword } from "../define.js";

// EDHREC rank 19608. X counts the listed abilities found, not the creatures
// with them: one per ability that at least one creature you control has, as
// the trigger resolves (Odric himself included). Two fliers make one Blood; a
// creature with reach and vigilance makes two (the rulings). Each keyword is
// read through the layer fold, granted ones included (Odric, Lunarch
// Marshal's shape). The engine models no "hexproof from" variant, so plain
// hexproof is the only one there is to count.
const TEXT =
  "When Odric enters, create X Blood tokens, where X is the number of abilities from among flying, first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, reach, trample, and vigilance found among creatures you control.";

const LISTED: readonly Keyword[] = [
  "flying",
  "first-strike",
  "double-strike",
  "deathtouch",
  "haste",
  "hexproof",
  "indestructible",
  "lifelink",
  "menace",
  "reach",
  "trample",
  "vigilance",
];

const ABILITIES_FOUND: EffectAmount = {
  sum: LISTED.map(
    (keyword): EffectAmount => ({
      ifCondition: { kind: "controls", filter: { type: "creature", controlledBy: "you", keyword }, atLeast: 1 },
      then: 1,
      else: 0,
    }),
  ),
};

export default defineCard({
  name: "Odric, Blood-Cursed",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Count each ability only once.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: ABILITIES_FOUND },
      resolve: null,
      text: TEXT,
    },
  ],
});
