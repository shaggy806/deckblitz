import { defineCard } from "../define.js";

export default defineCard({
  name: "Ascend from Avernus",
  manaCost: "{X}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "Return all creature and planeswalker cards with mana value X or less from your graveyard to the battlefield. Exile Ascend from Avernus.",
  effect: {
    kind: "return-from-graveyard",
    filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: "x" } },
    destination: "battlefield",
    count: "all",
  },
});
