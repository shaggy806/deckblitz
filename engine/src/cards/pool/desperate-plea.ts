import { defineCard } from "../define.js";

// EDHREC rank 10553. The sacrificed creature's power as it last existed (Fling's
// `{ paid: "sacrificed" }`), compared as the spell resolves. Targets are chosen
// before the sacrifice is paid, so the first mode can't return the creature
// sacrificed for it (the ruling).

const RETURN_TEXT =
  "Return target creature card from your graveyard to the battlefield if its power is less than or equal to the sacrificed creature's power.";
const DESTROY_TEXT = "Destroy target creature.";

export default defineCard({
  name: "Desperate Plea",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: `As an additional cost to cast this spell, sacrifice a creature.\nChoose one or both —\n• ${RETURN_TEXT}\n• ${DESTROY_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: RETURN_TEXT,
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: {
          kind: "conditional",
          condition: {
            kind: "target",
            index: 0,
            filter: { power: { op: "lte", n: { amount: { powerOf: { paid: "sacrificed" } } } } },
          },
          then: { kind: "put-onto-battlefield", target: 0 },
        },
      },
      { text: DESTROY_TEXT, targets: ["creature"], effect: { kind: "destroy", target: 0 } },
    ],
  },
});
