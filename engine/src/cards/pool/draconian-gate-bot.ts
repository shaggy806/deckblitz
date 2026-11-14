import { defineCard } from "../define.js";

// "Destroy target Attraction": an Attraction card goes to its owner's junkyard
// instead of their graveyard (rule 717.6); a copy of one goes to the graveyard
// (its ruling) — the junkyard replacement, not this card, says so.

const ENTER =
  "When this creature enters, choose one —\n• Open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)\n• Destroy target Attraction. (It's put into its owner's junkyard.)";

export default defineCard({
  name: "Draconian Gate-Bot",
  manaCost: "{5}",
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 4,
  toughness: 2,
  text: ENTER,
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
            text: "Open an Attraction.",
            effect: { kind: "open-attraction" },
          },
          {
            text: "Destroy target Attraction.",
            targets: [{ kind: "permanent", filter: { subtype: "Attraction" } }],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
