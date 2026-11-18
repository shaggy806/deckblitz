import { defineCard } from "../define.js";

// Rulings:
//   To determine the number of differently named artifact tokens you control, count each artifact
//     token you control once, but only if its English name isn't exactly the same as another
//     artifact token you've already counted this way.
//   A token's name is its subtypes plus the word "Token" unless it's copying another object or it
//     was given a specific name by the effect that created it. For example, the tokens created by
//     Gimbal's last ability are named "Gremlin Token." These tokens have the same name as the 2/2
//     red Gremlin creature tokens created by Release the Gremlins.

const TRAMPLE_TEXT = "Artifact creatures you control have trample.";
const END_TEXT =
  "At the beginning of your end step, create a 0/0 red Gremlin artifact creature token. Put X +1/+1 counters on it, where X is the number of differently named artifact tokens you control.";

export default defineCard({
  name: "Gimbal, Gremlin Prodigy",
  manaCost: "{2}{G}{U}{R}",
  colors: ["G", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gremlin", "Artificer"],
  power: 4,
  toughness: 4,
  text: `${TRAMPLE_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // X is read once the Gremlin is there, so it counts itself (608.2h).
      effect: {
        kind: "create-token",
        token: "Gremlin Artifact Token (0/0)",
        count: 1,
        thenCounters: {
          kind: "+1/+1",
          amount: { aggregate: "distinct", of: "name", filter: { token: true, type: "artifact", controlledBy: "you" } },
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
