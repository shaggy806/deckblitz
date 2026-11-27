import { defineCard } from "../define.js";

// EDHREC rank 26028.
//
// One ability with two trigger events, written as two triggers (Powerleech's
// shape). The activation half is any player's (`who: "any"`), a mana
// ability's too (`orMana`: the card doesn't say "that isn't a mana
// ability"), and only one whose cost has no {T} — one with {T} taps the
// artifact, which the first half sees instead. "That artifact's controller"
// is the artifact's, not the activating player's (`objectIsSource`), read as
// it last existed if its own cost sacrificed it.

const TEXT =
  "Whenever an artifact becomes tapped or a player activates an artifact's ability without {T} in its activation cost, this enchantment deals 1 damage to that artifact's controller.";

export default defineCard({
  name: "Haunting Wind",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: { controllerOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "activates-ability",
        who: "any",
        source: { type: "artifact" },
        orMana: true,
        withoutTapCost: true,
        objectIsSource: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "damage", amount: 1, who: { controllerOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
