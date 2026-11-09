import { defineCard } from "../define.js";

const TEXT =
  "You may cast artifact spells from your graveyard by paying 3 life in addition to paying their other costs. If you cast a spell this way, that artifact enters with a finality counter on it.";

export default defineCard({
  name: "Noctis, Prince of Lucis",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 4,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "graveyard", filter: { type: "artifact" }, payLife: 3, entersWith: { kind: "finality", amount: 1 } },
      text: TEXT,
    },
  ],
});
