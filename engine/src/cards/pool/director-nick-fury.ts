import { defineCard } from "../define.js";

// EDHREC rank 12031.

const COST_TEXT = "Hero spells you cast cost {1} less to cast.";
const ATTACK_TEXT =
  "Whenever you attack, look at the top four cards of your library. You may reveal a Hero card from among them and put that card into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Director Nick Fury",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 4,
  text: `${COST_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Hero" }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtype: "Hero" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
