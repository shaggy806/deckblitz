import { defineCard } from "../define.js";

const EMINENCE_TEXT =
  "Eminence — As long as Efteekay is in the command zone or on the battlefield, other Kavu spells you cast cost {1} less to cast.";
const ENTER_TEXT =
  "Whenever Efteekay or another Kavu you control enters, it deals damage equal to its power to target creature.";

export default defineCard({
  name: "Efteekay, Flame of the Kav",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kavu", "Soldier"],
  power: 4,
  toughness: 2,
  text: `${EMINENCE_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      fromCommandZone: true,
      costModification: {
        applies: { subtype: "Kavu", controlledBy: "you" },
        reduceGeneric: 1,
        otherOnly: true,
      },
      text: EMINENCE_TEXT,
    },
  ],
  triggered: [
    {
      // "It" is the Kavu that entered: it deals the damage (Warstorm Surge).
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Kavu" } },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
