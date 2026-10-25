import { defineCard } from "../define.js";

const TEXT = "Delirium — This creature gets +2/+2 as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Gnarlwood Dryad",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Horror"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  static: [{ affects: { scope: "self" }, condition: { kind: "delirium" }, grantPt: [2, 2], text: TEXT }],
});
