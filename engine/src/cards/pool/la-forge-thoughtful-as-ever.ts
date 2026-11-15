import { defineCard } from "../define.js";

// EDHREC rank 29371.

const TEXT =
  "{T}: For each permanent you control that you've put a counter on this turn, create a 1/1 blue Faerie creature token with flying.";

// Each permanent once however many counters went on it, in the stint it's in
// now (rule 400.7): one that left and came back is a new object.
export default defineCard({
  name: "La Forge, Thoughtful as Ever",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Faerie Token",
        count: { countOf: { controlledBy: "you", journaled: { what: "counters-put", by: "you" } } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
