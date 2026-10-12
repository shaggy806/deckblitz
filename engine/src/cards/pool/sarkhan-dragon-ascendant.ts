import { defineCard } from "../define.js";

// EDHREC rank 7120.
//
// "You may behold a Dragon" (rule 701.4a) isn't offered with no Dragon card
// in hand and no Dragon on the battlefield; "if you do" follows the behold.
// Sarkhan himself is a Dragon to behold while his own ability has made him
// one. "Becomes a Dragon in addition to his other types" is layer 4, until
// end of turn — so is the flying; the counter stays.

const ENTER_TEXT = "When Sarkhan enters, you may behold a Dragon. If you do, create a Treasure token.";
const DRAGON_TEXT =
  "Whenever a Dragon you control enters, put a +1/+1 counter on Sarkhan. Until end of turn, Sarkhan becomes a Dragon in addition to his other types and gains flying.";

export default defineCard({
  name: "Sarkhan, Dragon Ascendant",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT} (To behold a Dragon, choose a Dragon you control or reveal a Dragon card from your hand.)\n${DRAGON_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Behold a Dragon?",
        effect: { kind: "behold", filter: { subtype: "Dragon" }, text: "a Dragon" },
        then: { kind: "create-token", token: "Treasure Token", count: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "add-types", target: "source", addSubtypes: ["Dragon"], duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: DRAGON_TEXT,
    },
  ],
});
