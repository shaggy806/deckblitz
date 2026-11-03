import { defineCard } from "../define.js";

// Ruling: the second ability counts the creatures with power 4 or greater you attack with when it
//   triggers. Even if some or all are no longer attacking or no longer have power 4 or greater when
//   it resolves, they still count towards how many lands you can search for.

const ENTER_TEXT = "When The Earth King enters, create a 4/4 green Bear creature token.";
const ATTACK_TEXT =
  "Whenever one or more creatures you control with power 4 or greater attack, search your library for up to that many basic land cards, put them onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "The Earth King",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bear Token (Green 4/4)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks-batch", who: "you", filter: { type: "creature", power: { op: "gte", n: 4 } } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: { triggerValue: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
