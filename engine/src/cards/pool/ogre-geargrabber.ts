import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks, gain control of target Equipment an opponent controls until end of turn. Attach it to this creature. When you lose control of that Equipment, unattach it.";

// The Equipment comes off whatever it's on when you lose control of it, this
// creature gone or not (the ruling).
export default defineCard({
  name: "Ogre Geargrabber",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { subtype: "Equipment" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "attach", target: "source", attachment: 0 },
          {
            kind: "delayed-trigger",
            at: { losesControl: 0 },
            effect: { kind: "unattach", target: 0 },
            text: "When you lose control of that Equipment, unattach it.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
