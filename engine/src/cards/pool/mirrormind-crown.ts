import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const TEXT = "As long as this Equipment is attached to a creature, the first time you would create one or more tokens each turn, you may instead create that many tokens that are copies of equipped creature.";

export default defineCard({
  name: "Mirrormind Crown",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2}`,
  activated: [equip("{2}")],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      replacement: {
        event: "would-create-token",
        firstEachTurn: true,
        may: true,
        becomes: {
          effect: { kind: "create-token-copy", of: "equipped", count: "x", who: "you" },
          text: "Create that many tokens that are copies of equipped creature",
        },
      },
      text: TEXT,
    },
  ],
});
