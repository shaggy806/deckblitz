import { defineCard } from "../define.js";

const TEXT = "This token's power and toughness are each equal to the number of fade counters on Saproling Burst.";

/** Saproling Burst's green Saproling: a star/star reading the fade counters on
 * the Saproling Burst it was created with ("each token knows which Saproling
 * Burst it came from", the ruling). The art is the vanilla Saproling token's. */
export default defineCard({
  name: "Saproling Token (Saproling Burst)",
  tokenName: "Saproling Token",
  art: "0b425bdc-b3d5-4825-9f97-a00e2d932438",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Saproling"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countersOnMaker: "fade" }, plusPower: 0, plusToughness: 0 },
      text: TEXT,
    },
  ],
});
