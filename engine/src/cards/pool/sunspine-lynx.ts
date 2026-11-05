import { defineCard } from "../define.js";

// EDHREC rank 2907.

const NO_LIFE = "Players can't gain life.";
const NO_PREVENT = "Damage can't be prevented.";
const ENTERS = "When this creature enters, it deals damage to each player equal to the number of nonbasic lands that player controls.";

export default defineCard({
  name: "Sunspine Lynx",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 5,
  toughness: 4,
  text: `${NO_LIFE}\n${NO_PREVENT}\n${ENTERS}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: NO_LIFE,
    },
    { affects: { scope: "self" }, damageCantBePrevented: {}, text: NO_PREVENT },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "damage",
        who: "each-player",
        amount: { countOf: { type: "land", notSupertype: "basic", controlledBy: "you" }, forEachPlayer: true },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
