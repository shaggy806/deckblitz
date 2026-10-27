import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 29676.
//
// Rulings:
//   [2004-10-04] It checks the creature type when the ability is announced and resolved, but once
//     the effect is placed on the creature, if its creature type changes the effect still
//     continues.
//
// Both halves last "while-source-tapped": they end once the Courier untaps or
// leaves, and a Goblin that stops being one keeps them (the ruling).

const ACTIVATED_TEXT =
  "{2}{R}, {T}: Target Goblin creature gets +2/+2 and has haste for as long as this creature remains tapped.";

export default defineCard({
  name: "Flamestick Courier",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: `You may choose not to untap this creature during your untap step.\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Goblin" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "while-source-tapped" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
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
