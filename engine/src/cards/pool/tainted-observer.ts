import { defineCard } from "../define.js";

// EDHREC rank 7185.
//
// "You may pay {2}. If you do, proliferate" is Mentor of the Meek's paid
// `may`; the proliferate asks its own choices as it applies.

const TRIGGER_TEXT = "Whenever another creature you control enters, you may pay {2}. If you do, proliferate.";

export default defineCard({
  name: "Tainted Observer",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  toxic: 1,
  text: `Flying\nToxic 1 (Players dealt combat damage by this creature also get a poison counter.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "may", prompt: "Pay {2} to proliferate?", cost: "{2}", effect: { kind: "proliferate" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
