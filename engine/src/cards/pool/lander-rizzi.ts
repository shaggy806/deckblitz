import { defineCard } from "../define.js";

// Playtest card (Unknown Event). "Lander" in its text is Lander Rizzi itself.
// It's a Lander, so its own entry fires Landerfall as well as each lander
// token's (a "whenever a lander you control enters" with no "another"). The
// tokens are the Lander tokens of Edge of Eternities, the same ability.

const ENTERS_TEXT =
  "When Lander enters, create X lander tokens (They're artifacts with \"{2}, {T}, Sacrifice this token: Search you library for a basic land card, put it onto the battlefield tapped, then shuffle.)";
const LANDERFALL_TEXT = "Landerfall — Whenever a lander you control enters, put a +1/+1 counter on Lander.";
const SAC_TEXT =
  "{2}, {T}, Sacrifice Lander: Search you library for a basic land card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Lander Rizzi",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Lander", "Rogue"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${LANDERFALL_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", supertype: "basic" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: "x" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Lander" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LANDERFALL_TEXT,
    },
  ],
});
