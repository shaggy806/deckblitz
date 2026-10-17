import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// "You may tap it. When you do, destroy target creature with power 4 or
// less": the target is chosen as the reflexive ability goes on the stack,
// only once it has been tapped (rule 603.12). The loss reaches the
// permanents opponents control as it resolves (rule 611.2c).

const ENTER_TEXT =
  "When The Fire Nation Drill enters, you may tap it. When you do, destroy target creature with power 4 or less.";
const LOSE_TEXT = "{1}: Permanents your opponents control lose hexproof and indestructible until end of turn.";

export default defineCard({
  name: "The Fire Nation Drill",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${LOSE_TEXT}\nCrew 2`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Tap The Fire Nation Drill?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "tapped" },
              then: {
                kind: "reflexive-trigger",
                targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 4 } } }],
                effect: { kind: "destroy", target: 0 },
                text: "When you do, destroy target creature with power 4 or less.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "lose-keywords",
        filter: { controlledBy: "opponent" },
        keywords: ["hexproof", "indestructible"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: LOSE_TEXT,
    },
    crew(2),
  ],
});
