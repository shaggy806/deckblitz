import { defineCard } from "../define.js";

// Journey into Nyx. Rule 610.3, as Kitesail Freebooter's.

const TEXT =
  "When this creature enters, target opponent reveals their hand and you choose a nonland card from it. Exile that card until this creature leaves the battlefield.";

export default defineCard({
  name: "Brain Maggot",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        destination: "exile",
        untilSourceLeaves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
