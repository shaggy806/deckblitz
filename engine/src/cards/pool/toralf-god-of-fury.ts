import { defineCard } from "../define.js";

// Rulings: the excess is what that one damage event dealt past lethal, and the
// damage Toralf deals is itself noncombat damage, so it can trigger Toralf again.
const TEXT =
  "Whenever a creature or planeswalker an opponent controls is dealt excess noncombat damage, Toralf deals damage equal to the excess to any target other than that permanent.";

export default defineCard({
  name: "Toralf, God of Fury",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  faces: ["Toralf, God of Fury", "Toralf's Hammer"],
  triggered: [
    {
      trigger: {
        on: "dealt-damage",
        who: "opponent",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        combat: false,
        excess: true,
      },
      targets: [{ kind: "other", of: "any-target", than: "trigger-object" }],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
