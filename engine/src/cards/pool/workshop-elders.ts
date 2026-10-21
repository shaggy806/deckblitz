import { defineCard } from "../define.js";

const FLYING = "Artifact creatures you control have flying.";
const COMBAT =
  "At the beginning of combat on your turn, you may have target noncreature artifact you control become a 0/0 artifact creature. If you do, put four +1/+1 counters on it.";

export default defineCard({
  name: "Workshop Elders",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 4,
  toughness: 4,
  text: `${FLYING}\n${COMBAT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["flying"],
      text: FLYING,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } }],
      // The animation lasts indefinitely (its ruling).
      effect: {
        kind: "may",
        prompt: "Have that artifact become a 0/0 artifact creature with four +1/+1 counters?",
        effect: {
          kind: "animate",
          target: 0,
          power: 0,
          toughness: 0,
          addTypes: ["artifact", "creature"],
          addSubtypes: [],
          duration: "permanent",
        },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
