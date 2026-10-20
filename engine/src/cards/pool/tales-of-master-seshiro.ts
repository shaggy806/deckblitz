import { defineCard } from "../define.js";

// EDHREC rank 16478.
//
// Chapter III is Boseiju Reaches Skyward's: it comes back as Seshiro's Living
// Legacy, a new object.
const I_II_TEXT =
  "I, II — Put a +1/+1 counter on target creature or Vehicle you control. It gains vigilance until end of turn.";
const III_TEXT = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Tales of Master Seshiro",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${I_II_TEXT}\n${III_TEXT}`,
  faces: ["Tales of Master Seshiro", "Seshiro's Living Legacy"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [
        { kind: "permanent", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: I_II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
