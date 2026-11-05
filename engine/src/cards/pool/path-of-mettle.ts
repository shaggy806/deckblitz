import { defineCard } from "../define.js";

const ENTERS =
  "When Path of Mettle enters, it deals 1 damage to each creature that doesn't have first strike, double strike, vigilance, or haste.";
const ATTACK =
  "Whenever you attack with at least two creatures that have first strike, double strike, vigilance, and/or haste, transform Path of Mettle.";
const QUICK = [{ keyword: "first-strike" }, { keyword: "double-strike" }, { keyword: "vigilance" }, { keyword: "haste" }] as const;

export default defineCard({
  name: "Path of Mettle",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTERS}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", not: { anyOf: QUICK } }, amount: 1 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2, filter: { type: "creature", anyOf: QUICK } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: ATTACK,
    },
  ],
  faces: ["Path of Mettle", "Metzali, Tower of Triumph"],
  transform: true,
});
