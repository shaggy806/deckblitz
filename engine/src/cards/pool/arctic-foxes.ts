import { defineCard } from "../define.js";

const TEXT = "This creature can't be blocked by creatures with power 2 or greater as long as defending player controls a snow land.";

export default defineCard({
  name: "Arctic Foxes",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "land", supertype: "snow" }, atLeast: 1 },
      },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "gte", n: 2 } } }],
      text: TEXT,
    },
  ],
});
