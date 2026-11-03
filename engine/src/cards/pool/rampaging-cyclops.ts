import { defineCard } from "../define.js";

// Dominaria (DOM). EDHREC rank 31964.
//
// Read continuously: a blocker removed so that only one is left turns it off.
const TEXT = "This creature gets -2/-0 as long as two or more creatures are blocking it.";

export default defineCard({
  name: "Rampaging Cyclops",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { blockerCount: { op: "gte", n: 2 } } },
      grantPt: [-2, 0],
      text: TEXT,
    },
  ],
});
