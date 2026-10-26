import { defineCard } from "../define.js";

// EDHREC rank 31041.

export default defineCard({
  name: "Daughter of Autumn",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 2,
  toughness: 4,
  text: "{W}: The next 1 damage that would be dealt to target white creature this turn is dealt to Daughter of Autumn instead.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", colors: ["W"] } }],
      // Rule 614.9: a redirection.
      effect: { kind: "prevent-damage", target: 0, amount: 1, redirectTo: "source" },
      resolve: null,
      text: "{W}: The next 1 damage that would be dealt to target white creature this turn is dealt to Daughter of Autumn instead.",
    },
  ],
});
