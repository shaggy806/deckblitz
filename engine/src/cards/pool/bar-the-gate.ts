import { defineCard } from "../define.js";

// EDHREC rank 10057. One target: if it's gone illegal the spell doesn't resolve, so it doesn't
// venture either (rule 608.2b).
export default defineCard({
  name: "Bar the Gate",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or planeswalker spell. Venture into the dungeon. (Enter the first room or advance to the next room.)",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "counter", target: 0 }, { kind: "venture" }],
  },
});
