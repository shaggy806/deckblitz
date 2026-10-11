import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Banned in Commander; in the pool for casual play.

const BOUNCE_TEXT = "{T}: Return target legendary creature to its owner's hand.";

export default defineCard({
  name: "Karakas",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `{T}: Add {W}.\n${BOUNCE_TEXT}`,
  activated: [
    addManaAbility({ mana: "W", text: "{T}: Add {W}." }),
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", supertype: "legendary" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
