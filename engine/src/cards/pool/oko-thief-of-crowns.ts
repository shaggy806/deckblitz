import { defineCard } from "../define.js";

// Rule 205.1a: "becomes a green Elk creature" replaces its card types and
// creature types; a lost Equipment subtype goes with the lost artifact type.
const PLUS_TWO = '[+2]: Create a Food token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")';
const PLUS_ONE = "[+1]: Target artifact or creature loses all abilities and becomes a green Elk creature with base power and toughness 3/3.";
const MINUS_FIVE =
  "[-5]: Exchange control of target artifact or creature you control and target creature an opponent controls with power 3 or less.";

export default defineCard({
  name: "Oko, Thief of Crowns",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Oko"],
  loyalty: 4,
  text: `${PLUS_TWO}\n${PLUS_ONE}\n${MINUS_FIVE}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: PLUS_TWO,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 3,
        addTypes: [],
        setTypes: ["creature"],
        addSubtypes: [],
        setSubtypes: ["Elk"],
        setColors: ["G"],
        loseAbilities: true,
        duration: "permanent",
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
        { kind: "permanent", whose: "opponent", filter: { type: "creature", power: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "exchange-control", objects: [0, 1] },
      resolve: null,
      text: MINUS_FIVE,
    },
  ],
});
