import { defineCard } from "../define.js";

// "Creature cards exiled with this artifact" are the ones still in exile
// (`now`), linked to it (rule 607.2a). The intervening if is checked as it
// triggers and as it resolves (rule 603.4).

const EXILE_TEXT = "{2}, {T}: Exile target card from an opponent's graveyard. If it's a creature card, draw a card.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if there are four or more creature cards exiled with this artifact, flip a coin. If you lose the flip, sacrifice this artifact and return a card exiled with it at random to its owner's hand.";

export default defineCard({
  name: "Negative Zone Portal",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${UPKEEP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "exiled-with-source", atLeast: 4, now: true, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "flip-coin",
        lost: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-source" },
            {
              kind: "choose-random-card",
              zone: "exiled-with-source",
              then: { kind: "return-to-hand", target: 0, from: "exile" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
