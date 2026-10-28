import { defineCard } from "../define.js";

// EDHREC rank 5984.

const PREVENT_TEXT = "Prevent all noncombat damage that would be dealt to you and creatures you control.";
const TOKEN_TEXT = "Whenever a nontoken creature you control enters, create a 2/2 white Unicorn creature token.";

// The prevention is two replacements, one per recipient: the player (`to:
// "you"`) and the creatures (`toFilter`). Life loss isn't damage (its ruling).

export default defineCard({
  name: "Blessed Sanctuary",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${PREVENT_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: false, prevent: true, to: "you" },
      text: PREVENT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        prevent: true,
        toFilter: { type: "creature", controlledBy: "you" },
      },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Unicorn Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
