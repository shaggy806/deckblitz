import { defineCard } from "../define.js";

const TEXT =
  "When Subcommander T'Pol enters, choose one —\n• Counter target activated or triggered ability.\n• Tap up to one target artifact or creature. Put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Subcommander T'Pol",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Scientist"],
  power: 3,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            targets: ["activated-or-triggered-ability"],
            effect: { kind: "counter", target: 0 },
            text: "Counter target activated or triggered ability.",
          },
          {
            text: "Tap up to one target artifact or creature. Put a stun counter on it.",
            targets: [{ kind: "optional", of: "artifact-or-creature" }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: 0 },
                { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
