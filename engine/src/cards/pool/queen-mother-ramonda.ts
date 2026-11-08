import { defineCard } from "../define.js";

const ENTERS = "When Queen Mother Ramonda enters, you become the monarch.";
const TEXT = "As long as you're the monarch, creatures with power 2 or less can't attack you.";

export default defineCard({
  name: "Queen Mother Ramonda",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Noble"],
  power: 3,
  toughness: 5,
  text: `${ENTERS}\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", power: { op: "lte", n: 2 } } },
      condition: { kind: "monarch", who: "you" },
      restrictions: [{ kind: "cant-attack", at: "you" }],
      text: TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ENTERS,
    },
  ],
});
