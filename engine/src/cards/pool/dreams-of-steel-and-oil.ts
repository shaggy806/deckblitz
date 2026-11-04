import { defineCard } from "../define.js";

// Rulings: you must choose an artifact or creature card from their hand if
// they reveal one, and from their graveyard if there's one there, and with
// none in the hand you still choose from the graveyard. Neither is a target.
// The two choices are made one after the other and the chosen cards go then:
// moving the hand's card first can't change what the graveyard holds, or
// anything else the second choice or the exile looks at.
const TEXT =
  "Target opponent reveals their hand. You choose an artifact or creature card from it, then choose an artifact or creature card from their graveyard. Exile the chosen cards.";

const ARTIFACT_OR_CREATURE = { typesAnyOf: ["artifact", "creature"] } as const;

export default defineCard({
  name: "Dreams of Steel and Oil",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: ARTIFACT_OR_CREATURE, destination: "exile", unlinked: true },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        from: { target: 0 },
        filter: ARTIFACT_OR_CREATURE,
        min: 1,
        max: 1,
        destination: "exile",
        unlinked: true,
        leftover: "stay",
      },
    ],
  },
});
