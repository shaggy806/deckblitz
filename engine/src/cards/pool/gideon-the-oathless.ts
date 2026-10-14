import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 21190.

export default defineCard({
  name: "Gideon the Oathless",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 3,
  toughness: 3,
  text: "Ward—Discard a card.\nWhenever a creature an opponent controls enters, Gideon deals 1 damage to that player.\nWhenever an opponent activates a loyalty ability, Gideon deals 1 damage to that player.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "creature", controlledBy: "opponent" },
      },
      targets: [],
      // "That player": the entering creature's controller.
      effect: { kind: "damage", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a creature an opponent controls enters, Gideon deals 1 damage to that player.",
    },
    {
      trigger: { on: "activates-ability", who: "opponent", loyalty: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: "Whenever an opponent activates a loyalty ability, Gideon deals 1 damage to that player.",
    },
    ward({ discard: 1 }),
  ],
});
