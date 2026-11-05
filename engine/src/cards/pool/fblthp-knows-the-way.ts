import { defineCard } from "../define.js";

const DOMAIN = "Domain — Fblthp's power is equal to the number of basic land types among lands you control.";
const ENTERS =
  "When Fblthp enters, search your library for up to X basic land cards with different names, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Fblthp, Knows the Way",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homunculus", "Scout"],
  power: 0,
  toughness: 2,
  text: `${DOMAIN}\n${ENTERS}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { basicLandTypes: "you" }, plusPower: 0, plusToughness: 0, only: "power" },
      text: DOMAIN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        reveal: true,
        min: 0,
        max: "x",
        together: { distinctNames: true },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
