import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this artifact: You gain 3 life.\")";

export default defineCard({
  name: "Concession Stand",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "205a", lights: [2, 6] },
    { collector: "205b", lights: [3, 6] },
    { collector: "205c", lights: [4, 6] },
    { collector: "205d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      { kind: "create-token", token: "Food Token", count: 1 },
      VISIT,
    ),
  ],
});
