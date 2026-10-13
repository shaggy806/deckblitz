import { defineCard } from "../define.js";

// EDHREC rank 7003.
//
// Rulings:
//   [2016-11-08] Primeval Protector's ability can't reduce its cost below {G}.
//   [2016-11-08] Once a player has announced that they are casting Primeval Protector, no player
//     may take actions to try to change the number of creatures your opponents control in order to
//     increase its cost.

export default defineCard({
  name: "Primeval Protector",
  manaCost: "{10}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 10,
  toughness: 10,
  text: "This spell costs {1} less to cast for each creature your opponents control.\nWhen this creature enters, put a +1/+1 counter on each other creature you control.",
  // Generic mana only, so it never reduces the {G} (the first ruling).
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", controlledBy: "opponent" } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on each other creature you control.",
    },
  ],
});
