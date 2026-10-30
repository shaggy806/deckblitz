import { defineCard } from "../define.js";

// "That player" is the land's controller as it last existed on the
// battlefield; the count is read after the destruction, so the land itself is
// among the cards in their graveyard when they own it.
export default defineCard({
  name: "Roiling Terrain",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land, then Roiling Terrain deals damage to that land's controller equal to the number of land cards in that player's graveyard.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "damage",
        amount: { countInGraveyard: { type: "land", ownedBy: "you" }, forPlayer: { controllerOfTarget: 0 } },
        toControllerOfTarget: 0,
      },
    ],
  },
});
