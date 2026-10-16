import { defineCard } from "../define.js";

// EDHREC rank 15963. "Enters or dies": two triggers (Lys Alana Informant).
const TEXT = "When this creature enters or dies, surveil 1.";

export default defineCard({
  name: "Wary Watchdog",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 1,
  text: `${TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
