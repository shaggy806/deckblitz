import { defineCard } from "../define.js";

const CDA_TEXT = "Detritivore's power and toughness are each equal to the number of nonbasic land cards in your opponents' graveyards.";
const DESTROY_TEXT = "Whenever a time counter is removed from this card while it's exiled, destroy target nonbasic land.";

export default defineCard({
  name: "Detritivore",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 0,
  text: `${CDA_TEXT}\nSuspend X—{X}{3}{R}. X can't be 0. (Rather than cast this card from your hand, you may pay {X}{3}{R} and exile it with X time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)\n${DESTROY_TEXT}`,
  suspend: { n: "x", cost: "{X}{3}{R}" },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "land", notSupertype: "basic", ownedBy: "opponent" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "time" },
      whileSuspended: true,
      targets: [{ kind: "permanent", filter: { type: "land", notSupertype: "basic" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
