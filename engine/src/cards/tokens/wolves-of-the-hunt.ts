import { defineCard } from "../define.js";

// Master of the Hunt's 1/1 green Wolf, named Wolves of the Hunt, with "bands
// with other creatures named Wolves of the Hunt" (rule 702.22b): its own
// static, so a token that loses its abilities loses it too.
const TEXT = 'Bands with other creatures named Wolves of the Hunt';

export default defineCard({
  name: "Wolves of the Hunt",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      bandsWithOther: { type: "creature", name: "Wolves of the Hunt" },
      text: TEXT,
    },
  ],
});
