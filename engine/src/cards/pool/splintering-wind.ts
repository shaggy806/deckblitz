import { defineCard } from "../define.js";

// EDHREC rank 29727. Alliances.
//
// The Splinter's flying and cumulative upkeep are the token's own (quoted).
// "When it leaves the battlefield, it deals 1 damage to you and each creature
// you control" isn't: it's a delayed triggered ability the activation sets up
// (rule 603.7), watching that token from its creation (`leaves: "created"`) —
// so it fires however the token leaves, whoever controls it then, and "you"
// is the player who activated this (603.7d). "It" deals the damage: the token,
// as it last existed (`from: "trigger-object"`, rule 608.2h), to that player
// and each creature they control at once.

const LEAVES = "When it leaves the battlefield, it deals 1 damage to you and each creature you control.";
const TEXT =
  "{2}{G}: This enchantment deals 1 damage to target creature. Create a 1/1 green Splinter creature token. It has flying and \"Cumulative upkeep {G}.\" When it leaves the battlefield, it deals 1 damage to you and each creature you control.";

export default defineCard({
  name: "Splintering Wind",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", target: 0, amount: 1 },
          { kind: "create-token", token: "Splinter Token", count: 1 },
          {
            kind: "delayed-trigger",
            at: { leaves: "created", to: ["graveyard", "exile", "hand", "library", "command"] },
            effect: {
              kind: "sequence",
              simultaneous: true,
              effects: [
                { kind: "damage", amount: 1, who: "you", from: "trigger-object" },
                { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "you" }, from: "trigger-object" },
              ],
            },
            text: LEAVES,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
