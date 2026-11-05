import { defineCard } from "../define.js";

// EDHREC rank 25154.
//
// Grandeur is Baru, Fist of Krosa's discard cost. "Creatures that player
// controls can't attack this turn" is a turn-wide rule over the target
// player's creatures, ones arriving later included (`restrict`'s
// `controlledByTarget` — Concussive Bolt).
const PREVENT_TEXT = "{T}: Prevent all damage that would be dealt to target creature this turn.";
const GRANDEUR_TEXT =
  "Grandeur — Discard another card named Oriss, Samite Guardian: Target player can't cast spells this turn, and creatures that player controls can't attack this turn.";

export default defineCard({
  name: "Oriss, Samite Guardian",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${PREVENT_TEXT}\n${GRANDEUR_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: "all" },
      resolve: null,
      text: PREVENT_TEXT,
    },
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { name: "Oriss, Samite Guardian" } } },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "prohibit", who: 0, spells: true },
          {
            kind: "restrict",
            filter: { type: "creature", controlledBy: "you" },
            controlledByTarget: 0,
            restrictions: ["cant-attack"],
          },
        ],
      },
      resolve: null,
      text: GRANDEUR_TEXT,
    },
  ],
});
