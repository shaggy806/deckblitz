import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// The name is chosen as the reflexive ability resolves (the ruling), whose
// target was chosen as it triggered.
const WHEN_TEXT =
  "When you do, choose a nonland card name, then target player reveals their hand and discards all cards with that name.";
const TEXT = `At the beginning of your first main phase, you may sacrifice a creature. ${WHEN_TEXT}`;

export default defineCard({
  name: "Cabal Therapist",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice a creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", who: "you" },
              then: {
                kind: "reflexive-trigger",
                targets: ["player"],
                effect: {
                  kind: "choose-card-name",
                  filter: { notTypes: ["land"] },
                  then: { kind: "discard-hand", who: 0, filter: { hasName: CHOSEN_CARD_NAME }, reveal: true },
                },
                text: WHEN_TEXT,
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
