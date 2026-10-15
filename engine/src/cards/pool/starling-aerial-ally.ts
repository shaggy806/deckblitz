import { defineCard } from "../define.js";

// EDHREC rank 20659.

const ETB_TEXT = "When Starling enters, another target creature you control gains flying until end of turn.";

export default defineCard({
  name: "Starling, Aerial Ally",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
