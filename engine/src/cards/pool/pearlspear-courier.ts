import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 31653. Endoskeleton's and Hisoka's Guard's
// "for as long as this remains tapped", on a pump and a keyword. The Soldier
// type is checked only as it's activated and resolves (the ruling): the
// effects then stay on the creature whatever its type becomes.

const ACTIVATED_TEXT =
  "{2}{W}, {T}: Target Soldier creature gets +2/+2 and has vigilance for as long as this creature remains tapped.";

export default defineCard({
  name: "Pearlspear Courier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: `You may choose not to untap this creature during your untap step.\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Soldier" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "while-source-tapped" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "while-source-tapped" },
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
