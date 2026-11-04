import { defineCard } from "../define.js";

// EDHREC rank 1749.
//
// Rulings:
//   The ability that defines Daxos's toughness works in all zones, not just the battlefield.
//   Mana symbols in the text boxes of permanents you control don't count toward your devotion.
//   If another creature you control enters at the same time as Daxos, you gain 1 life for that
//     creature. Similarly, if another creature you control dies at the same time as Daxos, you gain 1
//     life for that creature. However, in the unusual case that Daxos dies at the same time that
//     another creature enters or vice versa, you won't gain 1 life for that creature.
//   Nonlethal damage dealt to Daxos may become lethal if your devotion to white decreases during
//     that turn.
//
// Toughness is a CDA over devotion to white (Tymaret's shape). "Enters or dies" is two triggered
// abilities (Apex Witchstalker's shape).
const CDA_TEXT =
  "Daxos's toughness is equal to your devotion to white. (Each {W} in the mana costs of permanents you control counts toward your devotion to white.)";
const LIFE_TEXT = "Whenever another creature you control enters or dies, you gain 1 life.";

export default defineCard({
  name: "Daxos, Blessed by the Sun",
  manaCost: "{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Demigod"],
  power: 2,
  toughness: 0,
  text: `${CDA_TEXT}\n${LIFE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { devotionTo: ["W"] }, plusPower: 0, plusToughness: 0, only: "toughness" },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: LIFE_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
