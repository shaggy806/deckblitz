import { defineCard } from "../define.js";

// Legends. EDHREC rank 25837.

const UPKEEP = "At the beginning of your upkeep, sacrifice Palladia-Mors unless you pay {R}{G}{W}.";

export default defineCard({
  name: "Palladia-Mors",
  manaCost: "{2}{R}{R}{G}{G}{W}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{R}{G}{W}", text: "Pay {R}{G}{W}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
