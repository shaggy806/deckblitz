import { defineCard } from "../define.js";

const PT_TEXT = "Duggan's power and toughness are each equal to the number of cards in your hand.";
const INVESTIGATE_TEXT = "Whenever Duggan enters or attacks, investigate.";
// "Activate only once": once for as long as this object exists — the
// `exhaust` bookkeeping, cleared by a zone change, so a Duggan that leaves and
// returns is a new object that may activate it again (the ruling; Haunted
// Screen's shape).
const PUNCH_TEXT =
  "The Most Important Punch in History — {1}{G}, {T}: Duggan deals damage equal to twice its power to another target creature. Activate only once.";

export default defineCard({
  name: "Duggan, Private Detective",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${INVESTIGATE_TEXT}\n${PUNCH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: INVESTIGATE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: INVESTIGATE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "damage", amount: { product: [{ powerOf: "source" }, 2] }, target: 0 },
      resolve: null,
      text: PUNCH_TEXT,
      exhaust: true,
    },
  ],
});
