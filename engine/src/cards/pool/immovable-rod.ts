import { defineCard } from "../define.js";

// EDHREC rank 13153.

const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";

export default defineCard({
  name: "Immovable Rod",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\nWhenever this artifact becomes untapped, venture into the dungeon.\n{3}{W}, {T}: For as long as this artifact remains tapped, another target permanent loses all abilities and can't attack or block.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "Whenever this artifact becomes untapped, venture into the dungeon.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: true },
      targets: [{ kind: "other", of: "permanent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-abilities", target: 0, duration: "while-source-tapped" },
          { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: "{3}{W}, {T}: For as long as this artifact remains tapped, another target permanent loses all abilities and can't attack or block.",
    },
  ],
});
