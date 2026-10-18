import { defineCard } from "../define.js";

// EDHREC rank 7890.

const ENTER_TEXT = "When this creature enters, you may pay {1}{G}. If you do, proliferate.";

export default defineCard({
  name: "Venomous Brutalizer",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 4,
  toughness: 4,
  toxic: 3,
  text: "Toxic 3 (Players dealt combat damage by this creature also get three poison counters.)\nWhen this creature enters, you may pay {1}{G}. If you do, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1}{G} to proliferate?", cost: "{1}{G}", effect: { kind: "proliferate" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
