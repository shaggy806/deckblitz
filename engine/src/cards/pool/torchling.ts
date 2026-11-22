import { defineCard } from "../define.js";

// EDHREC rank 20559.
//
// Rulings (from the triage record, B238): a spell targets "only this creature"
// when every target it has is Torchling; one aimed at it more than once has
// every one of those targets changed to the same new target. A new target must
// be legal for the spell (rule 115.7a), or the target doesn't change.
//
// Morphling's untap and P/T shifts; Auriok Siege Sled's "blocks this creature
// this turn if able"; Muck Drubb's "spell that targets only …".

const UNTAP = "{R}: Untap this creature.";
const LURE = "{R}: Target creature blocks this creature this turn if able.";
const REDIRECT = "{R}: Change the target of target spell that targets only this creature.";
const PUMP = "{1}: This creature gets +1/-1 until end of turn.";
const SHRINK = "{1}: This creature gets -1/+1 until end of turn.";

export default defineCard({
  name: "Torchling",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  text: [UNTAP, LURE, REDIRECT, PUMP, SHRINK].join("\n"),
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP,
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature" } }],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "must-block", attacker: "source" }] },
      resolve: null,
      text: LURE,
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "spell", filter: { targets: { only: true, source: true } } }],
      effect: { kind: "change-targets", target: 0, how: "change", sameNewTarget: true },
      resolve: null,
      text: REDIRECT,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: -1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: SHRINK,
    },
  ],
});
