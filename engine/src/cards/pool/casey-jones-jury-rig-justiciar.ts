import { defineCard } from "../define.js";

// EDHREC rank 17643.


const ENTER_TEXT =
  "When Casey Jones enters, look at the top four cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

// Tony Stark's look-and-choose, on an enters trigger.
export default defineCard({
  name: "Casey Jones, Jury-Rig Justiciar",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
