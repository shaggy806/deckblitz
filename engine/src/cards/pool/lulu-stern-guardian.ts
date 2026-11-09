import { defineCard } from "../define.js";

export default defineCard({
  name: "Lulu, Stern Guardian",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: "Whenever an opponent attacks you, choose target creature attacking you. Put a stun counter on that creature.\n{3}{U}: Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  triggered: [
    {
      trigger: { on: "attacks-player", who: "opponent", defender: "you" },
      targets: [{ kind: "permanent", filter: { type: "creature", attackingYou: true } }],
      effect: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
      resolve: null,
      text: "Whenever an opponent attacks you, choose target creature attacking you. Put a stun counter on that creature.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: "{3}{U}: Proliferate.",
    },
  ],
});
