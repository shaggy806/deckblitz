import { defineCard } from "../define.js";

// Dissension. A state trigger (rule 603.8 — its ruling): it triggers while a
// player other than its owner controls it, and again once the ability has left
// the stack if that's still so. "That player" is its controller, who controls
// the trigger; "if the player does" is `sacrifice-source`'s `then`, which a
// sacrifice that didn't happen (it left, or changed controllers back — the
// second ruling) skips.
const TEXT =
  "When a player other than this creature's owner controls it, that player sacrifices it. If the player does, this creature deals 7 damage to the player.";

export default defineCard({
  name: "Bronze Bombshell",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "state", state: { kind: "source", filter: { ownedBy: "opponent" } } },
      targets: [],
      effect: { kind: "sacrifice-source", then: { kind: "damage", amount: 7, who: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
