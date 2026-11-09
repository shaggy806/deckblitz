import { defineCard } from "../define.js";

export default defineCard({
  name: "Toph, the Blind Bandit",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 0,
  toughness: 3,
  text: "When Toph enters, earthbend 2. (Target land you control becomes a 0/0 creature with haste that's still a land. Put two +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)\nToph's power is equal to the number of +1/+1 counters on lands you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 2 },
      resolve: null,
      text: "When Toph enters, earthbend 2.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "sum", of: { counters: "+1/+1" }, filter: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: "Toph's power is equal to the number of +1/+1 counters on lands you control.",
    },
  ],
});
