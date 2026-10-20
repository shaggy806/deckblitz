import { defineCard } from "../define.js";

// EDHREC rank 10282.
//
// Mass Manipulation's "X target creatures and/or planeswalkers" after
// Betrayal at the Vault's "target creature you control deals damage equal to
// its power to each of …". The two "target" words are separate (rule 115.3),
// so the creature you control may also be one of the X. The damage is one
// event, its power read as the spell resolves.

export default defineCard({
  name: "Spinning Wheel Kick",
  manaCost: "{X}{X}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control deals damage equal to its power to each of X target creatures and/or planeswalkers.",
  targets: [
    "creature-you-control",
    {
      kind: "any-number",
      of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 1,
    simultaneous: true,
    effect: { kind: "damage", target: 1, amount: { powerOf: 0 }, from: { target: 0 } },
  },
});
