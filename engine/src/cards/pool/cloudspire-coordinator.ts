import { defineCard } from "../define.js";

// X counts the Mounts and Vehicles that entered under your control this turn,
// each as it entered.
const TOKENS =
  "{T}: Create X 1/1 colorless Pilot creature tokens, where X is the number of Mounts and/or Vehicles that entered the battlefield under your control this turn. The tokens have \"This token saddles Mounts and crews Vehicles as though its power were 2 greater.\"";

export default defineCard({
  name: "Cloudspire Coordinator",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 3,
  toughness: 1,
  text: `When this creature enters, scry 2.\n${TOKENS}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Pilot Token",
        count: { turnHistory: "entered", filter: { subtypes: ["Mount", "Vehicle"] } },
      },
      resolve: null,
      text: TOKENS,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When this creature enters, scry 2.",
    },
  ],
});
