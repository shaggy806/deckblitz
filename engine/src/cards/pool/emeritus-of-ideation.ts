import { defineCard } from "../define.js";
import { entersPrepared, ward } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Ancestral Recall, the
// pool's own card. "You may exile eight cards from your graveyard. If you
// do": the eight are chosen as it resolves; fewer than eight exiled (a
// smaller graveyard) isn't having done it.
const ATTACK_TEXT =
  "Whenever this creature attacks, you may exile eight cards from your graveyard. If you do, this creature " +
  "becomes prepared.";

export default defineCard({
  name: "Emeritus of Ideation",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  prepareSpell: "Ancestral Recall",
  text: `Flying, ward {2}\nThis creature enters prepared.\n${ATTACK_TEXT}`,
  static: [entersPrepared()],
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile eight cards from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 8,
              max: 8,
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 8 },
              then: { kind: "become-prepared", target: "source" },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
