import { defineCard } from "../define.js";

const BARDS_TEXT =
  "When this creature enters, you may pay {1}. When you do, create a Young Hero Role token attached to target creature you control.";

export default defineCard({
  name: "Merry Bards",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 3,
  toughness: 2,
  text: `${BARDS_TEXT} (If you control another Role on it, put that one into the graveyard. Enchanted creature has "Whenever this creature attacks, if its toughness is 3 or less, put a +1/+1 counter on it.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a Young Hero Role token?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature-you-control"],
          effect: { kind: "create-token", token: "Young Hero Role Token", count: 1, attachedTo: 0 },
          text: "When you do, create a Young Hero Role token attached to target creature you control.",
        },
      },
      resolve: null,
      text: BARDS_TEXT,
    },
  ],
});
