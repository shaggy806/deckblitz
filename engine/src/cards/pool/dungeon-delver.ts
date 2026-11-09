import { defineCard } from "../define.js";

const GRANTED = "Room abilities of dungeons you own trigger an additional time.";
const TEXT = `Commander creatures you own have "${GRANTED}"`;

export default defineCard({
  name: "Dungeon Delver",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsStatic: [{ affects: { scope: "self" }, doubleTriggers: { cause: "room" }, text: GRANTED }],
      text: TEXT,
    },
  ],
});
