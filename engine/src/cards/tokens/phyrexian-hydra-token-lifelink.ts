import { defineCard } from "../define.js";

/** 3/3 green and white Phyrexian Hydra with lifelink — Polukranos, Engine of Ruin's token. */
export default defineCard({
  name: "Phyrexian Hydra Token (Lifelink)",
  art: "a1bb0ec0-729e-4dcb-bab4-9f31c1056ab3",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Hydra"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: "Lifelink",
});
