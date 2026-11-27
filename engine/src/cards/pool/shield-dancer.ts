import { defineCard } from "../define.js";

// EDHREC rank 24861.
//
// A redirection (rule 614.9) of the next combat damage that creature would
// deal this creature, back to that creature itself (`"source-itself"`).

const TEXT =
  "{2}{W}: The next time target attacking creature would deal combat damage to this creature this turn, that creature deals that damage to itself instead.";

export default defineCard({
  name: "Shield Dancer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "damage-rule",
        to: { target: "source" },
        by: { target: 0 },
        combat: true,
        amount: "next-time",
        redirectTo: "source-itself",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
