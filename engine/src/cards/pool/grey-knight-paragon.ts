import { defineCard } from "../define.js";

// EDHREC rank 17223.

const RITES_TEXT =
  "Rites of Banishment — When this creature enters, destroy target attacking creature. If that creature is a Demon, exile it instead.";

export default defineCard({
  name: "Grey Knight Paragon",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Astartes", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${RITES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Demon" } },
        then: { kind: "exile", target: 0 },
        else: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: RITES_TEXT,
    },
  ],
});
