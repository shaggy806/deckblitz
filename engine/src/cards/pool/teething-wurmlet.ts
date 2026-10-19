import { defineCard } from "../define.js";

// EDHREC rank 7722.
//
// The deathtouch is Shimmer Dragon's conditional static, counting this
// creature too should it become an artifact (`countsSelf`). The trigger is
// Belladonna Took's "the first time this ability has resolved this turn":
// the life every time, the counter only on the first resolution.

const DEATHTOUCH_TEXT = "This creature has deathtouch as long as you control three or more artifacts.";
const ARTIFACT_TEXT =
  "Whenever an artifact you control enters, you gain 1 life. If this is the first time this ability has resolved this turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Teething Wurmlet",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 1,
  toughness: 1,
  text: `${DEATHTOUCH_TEXT}\n${ARTIFACT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 3, countsSelf: true },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 1 },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ARTIFACT_TEXT,
    },
  ],
});
