import { defineCard } from "../define.js";

// Master of Machines: X is the number of creatures tapped for the cost,
// announced as it's activated (`tapOthers.count: "x"`).

const FOUNDING_TEXT =
  "Ultima Founding — {T}, Tap two untapped artifacts you control: Create a 2/2 white Astartes Warrior creature token with vigilance.";
const MACHINES_TEXT =
  "Master of Machines — {T}, Tap X untapped creatures you control: Look at the top X cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Belisarius Cawl",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 4,
  text: `${FOUNDING_TEXT}\n${MACHINES_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, tapOthers: { count: 2, filter: { type: "artifact", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "create-token", token: "Astartes Warrior Token", count: 1 },
      resolve: null,
      text: FOUNDING_TEXT,
    },
    {
      cost: { mana: null, tap: true, tapOthers: { count: "x", filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: MACHINES_TEXT,
    },
  ],
});
