import { defineCard } from "../define.js";

const ENTERS = "When Oath of Ajani enters, put a +1/+1 counter on each creature you control.";
const DISCOUNT = "Planeswalker spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Oath of Ajani",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTERS}\n${DISCOUNT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "planeswalker" }, caster: "you", reduceGeneric: 1 },
      text: DISCOUNT,
    },
  ],
});
