import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// Makes Clue → "Clue Token".
//
// The exiled cards are linked to Lazav, not to what it's a copy of (rule
// 607.2a; the same permanent, rule 707.4). The card is chosen as the trigger
// resolves, and copied as the card it is. Until end of turn it has the copy's
// abilities alone (rule 707.2): Lazav's own come back at cleanup.
const ATTACK = "Whenever Lazav attacks, exile target card from a graveyard, then investigate.";
const COPY =
  "Whenever you sacrifice a Clue, you may have Lazav become a copy of a creature card exiled with it until end of turn.";

export default defineCard({
  name: "Lazav, Wearer of Faces",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Shapeshifter", "Detective"],
  power: 2,
  toughness: 3,
  text: `${ATTACK} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${COPY}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [{ kind: "exile", target: 0, linked: true }, investigate()],
      },
      resolve: null,
      text: ATTACK,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Lazav become a copy of a creature card exiled with it until end of turn?",
        effect: {
          kind: "look-and-choose",
          zone: "exiled-with-source",
          min: 1,
          max: 1,
          filter: { type: "creature" },
          destination: "stay",
          leftover: "stay",
          then: { kind: "become-copy", target: "source", of: 0, ofCard: true, until: "end-of-turn" },
        },
      },
      resolve: null,
      text: COPY,
    },
  ],
});
