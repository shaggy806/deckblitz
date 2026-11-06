import { defineCard } from "../define.js";

// Mystery Booster Commander. A Zombie Cat entering triggers both.
const ZOMBIE = "Whenever another Zombie you control enters, put a +1/+1 counter on target Cat you control.";
const CAT = "Whenever another Cat you control enters, put a +1/+1 counter on target Zombie you control.";
const END =
  "At the beginning of your end step, each opponent loses life equal to the number of tapped Cats and/or Zombies you control.";

export default defineCard({
  name: "Olag and Miau, New Friends",
  manaCost: "{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Cat"],
  power: 3,
  toughness: 3,
  text: `${ZOMBIE}\n${CAT}\n${END}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Zombie" }, otherOnly: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Cat" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ZOMBIE,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cat" }, otherOnly: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Zombie" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-opponent",
        amount: {
          countOf: { controlledBy: "you", tapped: true, anyOf: [{ subtype: "Cat" }, { subtype: "Zombie" }] },
        },
      },
      resolve: null,
      text: END,
    },
  ],
});
