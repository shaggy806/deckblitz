import { defineCard } from "../define.js";

// EDHREC rank 9979. Casey Jones's enters look, and Patchwork Automaton's
// cast trigger with Ascendant Dustspeaker's "another target creature you
// control".
const ENTER_TEXT =
  "When Guru Pathik enters, look at the top five cards of your library. You may reveal a Lesson, Saga, or Shrine card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const CAST_TEXT =
  "Whenever you cast a Lesson, Saga, or Shrine spell, put a +1/+1 counter on another target creature you control.";
const LESSON_SAGA_SHRINE = { subtypes: ["Lesson", "Saga", "Shrine"] } as const;

export default defineCard({
  name: "Guru Pathik",
  manaCost: "{2}{G/U}{G/U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk", "Ally"],
  power: 2,
  toughness: 4,
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: LESSON_SAGA_SHRINE,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: LESSON_SAGA_SHRINE },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
