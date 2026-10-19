import { defineCard } from "../define.js";

// The Brothers' War. "That player" is the opponent whose graveyard the card
// was in — its owner, who is also the controller a card outside the
// battlefield is read with (`toControllerOfTarget` reads it as it is now, in
// exile). "If it was a creature card" reads the card where it went.
const ENTERS_TEXT =
  "When this creature enters, exile target card from an opponent's graveyard. If it was a creature card, that player loses 1 life.";

export default defineCard({
  name: "Carrion Locust",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: { kind: "lose-life", amount: 1, toControllerOfTarget: 0 },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
