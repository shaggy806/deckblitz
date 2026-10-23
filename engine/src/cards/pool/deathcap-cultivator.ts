import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {B} or {G}.";
const DELIRIUM_TEXT =
  "Delirium — This creature has deathtouch as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Deathcap Cultivator",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 1,
  text: `${MANA_TEXT}\n${DELIRIUM_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "G"] }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantKeywords: ["deathtouch"],
      text: DELIRIUM_TEXT,
    },
  ],
});
