import { defineCard } from "../define.js";

const SQUIRRELS = "Target player creates two tapped 1/1 green Squirrel creature tokens.";
const COUNTER = "Counter target loyalty ability of a planeswalker.";
const EXILE = "Exile target card from a graveyard.";
const LIFE = "Target player gains 3 life.";

// A loyalty ability is an activated ability with a loyalty symbol in its
// cost (rule 606.2): the `loyalty` narrowing of an ability target.
export default defineCard({
  name: "Verdant Command",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose two —\n• ${SQUIRRELS}\n• ${COUNTER}\n• ${EXILE}\n• ${LIFE}`,
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: SQUIRRELS,
        targets: ["player"],
        effect: { kind: "create-token", token: "Squirrel Token", count: 2, tapped: true, who: "target-controller" },
      },
      {
        text: COUNTER,
        targets: [{ kind: "ability", loyalty: true, sourceTypes: ["planeswalker"] }],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: EXILE,
        targets: [{ kind: "card-in-graveyard" }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: LIFE,
        targets: ["player"],
        effect: { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
      },
    ],
  },
});
