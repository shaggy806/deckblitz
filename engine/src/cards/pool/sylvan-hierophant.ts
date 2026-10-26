import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, exile it, then return another target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Sylvan Hierophant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // Chosen as the trigger goes on the stack, another card than it; still
      // returned if the Hierophant has left the graveyard by then (the rulings).
      targets: [
        { kind: "other", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, than: "source" },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "return-to-hand", target: 0, from: "graveyard" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
