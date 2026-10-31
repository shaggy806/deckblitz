import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may search your library for a basic land card that doesn't share a land type with a land you control, put that card onto the battlefield, then shuffle.";
const TOKEN_TEXT =
  "{5}{G}: Create a 1/1 green Insect creature token. Put X +1/+1 counters on it, where X is the number of basic land types among lands you control. Activate only as a sorcery.";

// "Doesn't share a land type with a land you control": the land types of
// every land you control as the search begins, negated.
export default defineCard({
  name: "Hiveheart Shaman",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 5,
  text: `${ATTACK_TEXT}\n${TOKEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card that doesn't share a land type with a land you control?",
        effect: {
          kind: "search-library",
          filter: {
            type: "land",
            supertype: "basic",
            not: { sharesLandTypeWith: { controlled: { type: "land" } } },
          },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "create-token",
        token: "Insect Token",
        count: 1,
        thenCounters: { kind: "+1/+1", amount: { basicLandTypes: "you" } },
      },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
