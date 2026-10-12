import { defineCard } from "../define.js";

const ATTACKS_TEXT = "Whenever this token attacks, you gain 1 life.";

/** 1/1 black and green Pest with an attack trigger — Secrets of
 * Strixhaven's (Essenceknit Scholar, Send in the Pest, Pest Friend). Not the
 * older Pest, whose life comes when it dies (`Pest Token`). */
export default defineCard({
  name: "Pest Token (Attacks)",
  art: "40b22872-7b7b-4a6d-a343-4152e552b00a",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Pest"],
  power: 1,
  toughness: 1,
  text: ATTACKS_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: ATTACKS_TEXT,
    },
  ],
});
