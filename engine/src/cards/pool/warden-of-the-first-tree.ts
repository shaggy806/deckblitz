import { defineCard } from "../define.js";

// EDHREC rank 26120. Rulings (2014-11-24): neither of the first two abilities
// has a duration, and each replaces its other creature types (keeping its card
// types and supertypes); the first overwrites earlier base-P/T effects.

const WARRIOR_TEXT = "{1}{W/B}: This creature becomes a Human Warrior with base power and toughness 3/3.";
const SPIRIT_TEXT =
  "{2}{W/B}{W/B}: If this creature is a Warrior, it becomes a Human Spirit Warrior with trample and lifelink.";
const COUNTERS_TEXT = "{3}{W/B}{W/B}{W/B}: If this creature is a Spirit, put five +1/+1 counters on it.";

export default defineCard({
  name: "Warden of the First Tree",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: `${WARRIOR_TEXT}\n${SPIRIT_TEXT}\n${COUNTERS_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W/B}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Human", "Warrior"],
        duration: "permanent",
      },
      resolve: null,
      text: WARRIOR_TEXT,
    },
    {
      cost: { mana: "{2}{W/B}{W/B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Warrior" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-types", target: "source", setSubtypes: ["Human", "Spirit", "Warrior"], duration: "permanent" },
            { kind: "grant-keyword", target: "source", keyword: "trample", duration: "permanent" },
            { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "permanent" },
          ],
        },
      },
      resolve: null,
      text: SPIRIT_TEXT,
    },
    {
      cost: { mana: "{3}{W/B}{W/B}{W/B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Spirit" } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 5 },
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
