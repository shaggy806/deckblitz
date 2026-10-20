import { defineCard } from "../define.js";

// EDHREC rank 15136.
//
// Chapter III is Boseiju Reaches Skyward's: it comes back as Kirin-Touched
// Orochi, a new object.
const I_TEXT = "I — Mill three cards. Create a 1/1 colorless Spirit creature token.";
const II_TEXT = "II — Put a +1/+1 counter on target creature you control.";
const III_TEXT = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Teachings of the Kirin",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  faces: ["Teachings of the Kirin", "Kirin-Touched Orochi"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: II_TEXT,
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
