import { defineCard } from "../define.js";

// EDHREC rank 26765. Anarchist's and Scrivener's triggers, each narrowed by colour.

const RED_TEXT = "When this creature enters, you may return target red sorcery card from your graveyard to your hand.";
const BLUE_TEXT = "When this creature enters, you may return target blue instant card from your graveyard to your hand.";

export default defineCard({
  name: "Nucklavee",
  manaCost: "{4}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: `${RED_TEXT}\n${BLUE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "sorcery", colors: ["R"] } }],
      effect: {
        kind: "may",
        prompt: "Return target red sorcery card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: RED_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "instant", colors: ["U"] } }],
      effect: {
        kind: "may",
        prompt: "Return target blue instant card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: BLUE_TEXT,
    },
  ],
});
