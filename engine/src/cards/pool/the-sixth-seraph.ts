import { defineCard } from "../define.js";
import { demonstrate } from "../helpers.js";

// A playtest card (Mystery Booster 2). The artifact spells have demonstrate
// (rule 702.144a) as they're cast, as Elda, Conjurer of Spectacle grants it;
// a copy of a permanent spell becomes a token (rule 707.10f).

const TEXT =
  "Artifact spells you cast have demonstrate. (Whenever you cast an artifact spell, you may copy it. If you do, choose an opponent to also copy it. Each copy becomes a token.)";

export default defineCard({
  name: "The Sixth Seraph",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "artifact" }, triggered: [demonstrate()] },
      text: TEXT,
    },
  ],
});
