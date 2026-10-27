import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 30543.
//
// Rulings:
//   [2004-10-04] It checks the creature type when the ability is announced and resolved, but once
//     the effect is placed on the creature, if its creature type changes the effect still
//     continues.
//
// The Zombie check is the target filter (checked as it's chosen and as it
// resolves); both halves last "while-source-tapped", and neither rereads it.

const PUMP =
  "{2}{B}, {T}: Target Zombie creature gets +2/+2 and has fear for as long as this creature remains tapped. (It can't be blocked except by artifact creatures and/or black creatures.)";

export default defineCard({
  name: "Frightshroud Courier",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: `You may choose not to untap this creature during your untap step.\n${PUMP}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Zombie" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "while-source-tapped" },
          { kind: "grant-keyword", target: 0, keyword: "fear", duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: PUMP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this creature during your untap step.",
    },
  ],
});
