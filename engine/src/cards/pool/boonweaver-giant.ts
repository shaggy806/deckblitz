import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

// "Your graveyard, hand, and/or library": the player's choice of zones as it
// resolves, only a search of the library shuffling. An Aura that can't be
// attached to the Giant (one that can't enchant it, or the Giant has gone —
// rule 303.4i) stays where it was.

const ENTERS =
  "When this creature enters, you may search your graveyard, hand, and/or library for an Aura card and put it onto the battlefield attached to this creature. If you search your library this way, shuffle.";

export default defineCard({
  name: "Boonweaver Giant",
  manaCost: "{6}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Monk"],
  power: 4,
  toughness: 4,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your graveyard, hand, and/or library for an Aura card?",
        effect: searchZonesAndOr(["graveyard", "hand", "library"], {
          kind: "search-library",
          filter: { subtype: "Aura" },
          destination: "battlefield",
          attachedToSource: true,
          min: 0,
          max: 1,
        }),
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
