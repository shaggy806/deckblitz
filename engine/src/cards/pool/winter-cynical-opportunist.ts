import { defineCard } from "../define.js";

const MILL_TEXT = "Whenever Winter attacks, mill three cards.";
const END_TEXT =
  "Delirium — At the beginning of your end step, you may exile any number of cards from your graveyard " +
  "with four or more card types among them. If you do, put a permanent card from among them onto the " +
  "battlefield with a finality counter on it.";

const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] as const;

// "Delirium" is only an ability word (rule 207.2c): the trigger has no "if".
// The exile is a graveyard choice whose `together` asks for four or more card
// types among the chosen cards (`cardTypesAmongAtLeast`), none also an
// answer; any four types include a permanent type, so "if you do" always
// has a card to put.
export default defineCard({
  name: "Winter, Cynical Opportunist",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 5,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${MILL_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // With fewer than four card types in the graveyard no set of its cards
      // can be exiled, so there's nothing to ask (the `delirium` condition
      // reads exactly that; it is no "if" of the trigger's).
      effect: {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 0,
              max: 99,
              together: { cardTypesAmongAtLeast: 4 },
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: {
                kind: "look-and-choose",
                zone: "exiled-this-way",
                min: 1,
                max: 1,
                filter: { typesAnyOf: [...PERMANENT_TYPES] },
                destination: "battlefield",
                withCounters: { kind: "finality", amount: 1 },
                leftover: "stay",
              },
            },
          ],
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
