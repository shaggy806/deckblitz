import { defineCard } from "../define.js";

// EDHREC rank 7374. Commander 2017. With no type chosen, nothing is "of the
// chosen type", so the ability has no legal target and can't be activated
// (the ruling). Indestructible goes to every creature you control with a
// divinity counter, of the chosen type or not (the ruling).
const ACTIVATED = "{1}{W}: Put a divinity counter on target creature you control of the chosen type.";
const STATIC = "Each creature you control with a divinity counter on it has indestructible.";

export default defineCard({
  name: "Kindred Boon",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `As this enchantment enters, choose a creature type.\n${ACTIVATED}\n${STATIC}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "you", ofChosenType: true } }],
      effect: { kind: "add-counter", target: 0, counter: "divinity", amount: 1 },
      resolve: null,
      text: ACTIVATED,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "divinity", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["indestructible"],
      text: STATIC,
    },
  ],
});
