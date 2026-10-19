import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 16349.
//
// Each "becomes" is an `animate` of itself with no duration: its creature
// types are set (layer 4 — they replace Human, and each other) and its base
// P/T (layer 7b), both by timestamp, so activating the first ability again
// after the second makes it a 2/2 Human Cleric once more (the ruling), and a
// counter or a +N/+N still applies on top. The second and third abilities
// may be activated whatever it is, and check its creature types only as they
// resolve, doing nothing if it isn't one (the rulings) — the whole sentence
// after "if" is conditional, the draw and life loss included.
const FIRST_TEXT = "{B}: This creature becomes a Human Cleric with base power and toughness 2/2.";
const SECOND_TEXT =
  "{1}{B}: If this creature is a Cleric, put a deathtouch counter on it and it becomes a Phyrexian Human Cleric with base power and toughness 3/3.";
const THIRD_TEXT =
  "{1}{B}{B}: If this creature is a Phyrexian, put a +1/+1 counter on it, then you draw a card and you lose 1 life.";

export default defineCard({
  name: "Evolved Sleeper",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: `${FIRST_TEXT}\n${SECOND_TEXT}\n${THIRD_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Human", "Cleric"],
        duration: "permanent",
      },
      resolve: null,
      text: FIRST_TEXT,
    },
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Cleric" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "deathtouch", amount: 1 },
            {
              kind: "animate",
              target: "source",
              power: 3,
              toughness: 3,
              addTypes: [],
              addSubtypes: [],
              setSubtypes: ["Phyrexian", "Human", "Cleric"],
              duration: "permanent",
            },
          ],
        },
      },
      resolve: null,
      text: SECOND_TEXT,
    },
    {
      cost: { mana: "{1}{B}{B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Phyrexian" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "draw", amount: 1 },
            { kind: "lose-life", amount: 1, who: "you" },
          ],
        },
      },
      resolve: null,
      text: THIRD_TEXT,
    },
  ],
});
