import { defineCard } from "../define.js";

export default defineCard({
  name: "King Suleiman",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 1,
  toughness: 1,
  text: "{T}: Destroy target Djinn or Efreet.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtypes: ["Djinn", "Efreet"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target Djinn or Efreet.",
    },
  ],
});
