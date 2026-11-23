import { defineCard } from "../define.js";

const LORD_TEXT = "Land creatures and/or creatures you control with menace get +1/+1.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, target Swamp you control becomes a 0/0 black land creature and gains menace. It's still a land. Put a +1/+1 counter on it. (It can't be blocked except by two or more creatures. It's dark and scary.)";

export default defineCard({
  name: "The Swamp Kitten",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: `${LORD_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      // Creatures you control that are lands, have menace, or both — each
      // gets +1/+1 once.
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ type: "land" }, { keyword: "menace" }] },
      },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", filter: { subtype: "Swamp", controlledBy: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become",
            target: 0,
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            setColors: ["B"],
            keywords: ["menace"],
            duration: "permanent",
          },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
