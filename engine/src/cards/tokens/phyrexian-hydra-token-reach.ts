import { defineCard } from "../define.js";

/** 3/3 green and white Phyrexian Hydra with reach — Polukranos, Engine of Ruin's token. */
export default defineCard({
  name: "Phyrexian Hydra Token (Reach)",
  art: "2bff78d9-7c4c-4b3b-a485-5328e985315b",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Hydra"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach",
});
