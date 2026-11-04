import { defineCard } from "../define.js";

const LIFE_TEXT = "For each {B} in a cost, you may pay 2 life rather than pay that mana.";
const COUNTER_TEXT = "Whenever you cast a black spell, put a +1/+1 counter on K'rrik.";

export default defineCard({
  name: "K'rrik, Son of Yawgmoth",
  manaCost: "{4}{B/P}{B/P}{B/P}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Phyrexian", "Horror", "Minion"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `({B/P} can be paid with either {B} or 2 life.)\nLifelink\n${LIFE_TEXT}\n${COUNTER_TEXT}`,
  static: [{ affects: { scope: "self" }, payLifeForPips: "B", text: LIFE_TEXT }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
