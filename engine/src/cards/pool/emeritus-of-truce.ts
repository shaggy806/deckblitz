import { defineCard } from "../define.js";

// EDHREC rank 6848. A preparation card (rule 722): its prepare spell is
// Swords to Plowshares, the pool's own card. "Then if an opponent controls
// more creatures than you" is asked as the ability resolves, after the token
// is made — a token given to an opponent counts on their side.
const ENTERS_TEXT =
  "When this creature enters, target player creates a 1/1 white and black Inkling creature token with flying. " +
  "Then if an opponent controls more creatures than you, this creature becomes prepared.";

export default defineCard({
  name: "Emeritus of Truce",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 3,
  toughness: 3,
  prepareSpell: "Swords to Plowshares",
  text: `${ENTERS_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Inkling Token (Emeritus of Truce)", count: 1, who: "target-controller" },
          {
            kind: "conditional",
            condition: { kind: "opponent-controls-more", filter: { type: "creature" } },
            then: { kind: "become-prepared", target: "source" },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
