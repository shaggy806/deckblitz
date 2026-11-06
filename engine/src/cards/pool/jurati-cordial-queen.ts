import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more artifact creatures you control deal combat damage to a player, create a token that's a copy of target artifact token you control.";

export default defineCard({
  name: "Jurati, Cordial Queen",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg", "Scientist"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { types: ["artifact", "creature"] }, combat: true },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", token: true } }],
      effect: { kind: "create-token-copy", of: 0, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
