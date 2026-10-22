import { defineCard } from "../define.js";

// EDHREC rank 9786. Ixalan.
//
// The nontoken Pirate is an intervening-if (rule 603.4): checked as it
// attacks and again as the ability resolves, so with none left you can't pay
// (the ruling). One payment, one token.

export default defineCard({
  name: "Fathom Fleet Captain",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace\nWhenever this creature attacks, if you control another nontoken Pirate, you may pay {2}. If you do, create a 2/2 black Pirate creature token with menace.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Pirate", token: false }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a 2/2 black Pirate creature token with menace?",
        cost: "{2}",
        effect: { kind: "create-token", token: "Pirate Token", count: 1 },
      },
      resolve: null,
      text: "Whenever this creature attacks, if you control another nontoken Pirate, you may pay {2}. If you do, create a 2/2 black Pirate creature token with menace.",
    },
  ],
});
