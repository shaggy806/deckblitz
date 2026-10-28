import { defineCard } from "../define.js";

// EDHREC rank 5282.
//
// Synapse Sliver's shape: any Sliver, anyone's. The ruling: the controller of
// the Sliver that dealt the damage decides, and the token is theirs — the
// `each-player-may` effect is that player's, so "you" in it is them.

const TEXT =
  "Whenever a Sliver deals combat damage to a player, its controller may create a 1/1 colorless Sliver creature token.";

export default defineCard({
  name: "Brood Sliver",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { type: "creature", subtype: "Sliver" } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Create a 1/1 colorless Sliver creature token?",
        effect: { kind: "create-token", token: "Sliver Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
