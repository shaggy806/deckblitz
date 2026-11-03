import { defineCard } from "../define.js";

const ANIMATE =
  '{5}{G}{G}: This enchantment becomes a Bear creature in addition to its other types and gains "This creature\'s power and toughness are each equal to the number of lands you control." (This effect doesn\'t end.)';

export default defineCard({
  name: "Beorn's Hospitality",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Landfall — Whenever a land you control enters, put a +1/+1 counter on target creature you control.\n${ANIMATE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, put a +1/+1 counter on target creature you control.",
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "animate", target: "source", addTypes: ["creature"], addSubtypes: ["Bear"], duration: "permanent" },
          {
            kind: "grant-static",
            target: "source",
            ability: {
              affects: { scope: "self" },
              setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
              text: "This creature's power and toughness are each equal to the number of lands you control.",
            },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
