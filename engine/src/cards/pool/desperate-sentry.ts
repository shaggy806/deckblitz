import { defineCard } from "../define.js";

// EDHREC rank 25900.
const DIES_TEXT = "When this creature dies, create a 3/2 colorless Eldrazi Horror creature token.";
const DELIRIUM_TEXT =
  "Delirium — This creature gets +3/+0 as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Desperate Sentry",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: `${DIES_TEXT}\n${DELIRIUM_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Horror Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, condition: { kind: "delirium" }, grantPt: [3, 0], text: DELIRIUM_TEXT }],
});
