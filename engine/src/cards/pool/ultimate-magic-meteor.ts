import { defineCard } from "../define.js";

// Foretold, the spell is cast from exile (so is any other cast from there). The
// damage comes first, so what's chosen is what's left; each is chosen as this
// resolves, no target, and they're all destroyed at once.
const TEXT =
  "Ultimate Magic: Meteor deals 7 damage to each creature. If this spell was cast from exile, for each opponent, choose an artifact or land that player controls. Destroy the chosen permanents.";
const FORETELL =
  "Foretell {5}{R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)";

export default defineCard({
  name: "Ultimate Magic: Meteor",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${TEXT}\n${FORETELL}`,
  foretell: { cost: "{5}{R}" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 7 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "exile" } },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "vote",
              choose: true,
              who: "you",
              for: {
                permanent: { typesAnyOf: ["artifact", "land"] },
                about: "each-opponent",
                prompt: "Choose an artifact or land to destroy",
              },
            },
            {
              kind: "for-each-voted",
              which: "voted",
              simultaneous: true,
              effect: { kind: "destroy", target: 0 },
            },
          ],
        },
      },
    ],
  },
});
