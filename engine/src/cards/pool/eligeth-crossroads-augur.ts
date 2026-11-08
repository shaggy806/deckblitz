import { defineCard } from "../define.js";

const TEXT = "If you would scry a number of cards, draw that many cards instead.";

export default defineCard({
  name: "Eligeth, Crossroads Augur",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  pairing: { kind: "partner" },
  text: `Flying\n${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-scry", who: "you", instead: { effect: { kind: "draw", amount: "x" } } },
      text: TEXT,
    },
  ],
});
