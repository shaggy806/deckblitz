import { defineCard } from "../define.js";

const STATIC_TEXT =
  "Equipped creature can't attack, block, or transform, and its activated abilities can't be activated.";
const SHACKLE_TEXT =
  "Shackle {3} ({3}: Attach to target creature you don't control. Shackle only as a sorcery.)";

export default defineCard({
  name: "Avacyn's Collar, the Symbol of Her Church",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${SHACKLE_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: [
        { act: "activate", who: "each-player", of: { hostOfSource: true } },
        { act: "transform", object: { hostOfSource: true } },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "opponent" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: SHACKLE_TEXT,
      sorcerySpeed: true,
    },
  ],
});
