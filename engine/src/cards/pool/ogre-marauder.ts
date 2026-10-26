import { defineCard } from "../define.js";

// Betrayers of Kamigawa. EDHREC rank 25414.
//
// Rulings:
//   [2005-02-01] Ogre Marauder's ability requires the defending player to sacrifice a creature as
//     the ability resolves, or Ogre Marauder can't be blocked for the rest of the turn.
//   [2005-02-01] Attacking with Ogre Marauder a second time would cause a second trigger. If no
//     creature was previously sacrificed, the Marauder already can't be blocked. Sacrificing a
//     creature for the second trigger will not nullify the first.
//
// The defending player (Thraximundar's `"trigger-player"`) chooses as it
// resolves: sacrifice a creature of their choice, or the Marauder gains
// "can't be blocked" until end of turn (Elusive Spellfist's grant).

const TEXT =
  "Whenever this creature attacks, it gains \"this creature can't be blocked\" until end of turn unless defending player sacrifices a creature of their choice.";

export default defineCard({
  name: "Ogre Marauder",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-player",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        otherwise: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
