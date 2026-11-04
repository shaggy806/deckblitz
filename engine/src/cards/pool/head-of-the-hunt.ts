import { defineCard } from "../define.js";

// Makes Wolf → uses "Wolf Token".
//
// Rulings:
//   While it's on the battlefield, creatures your opponents control are exiled instead of dying.
//   Cards that would go to your opponent's graveyard for other reasons, such as being discarded or
//   milled, still go there.
//   If it would leave the battlefield at the same time as creatures an opponent controls would die,
//   those creatures will still be exiled.
const TEXT = "If a creature an opponent controls would die, exile it instead. When you do, create a 2/2 green Wolf creature token.";

export default defineCard({
  name: "Head of the Hunt",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 4,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
        then: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "create-token", token: "Wolf Token", count: 1 },
          text: "When you do, create a 2/2 green Wolf creature token.",
        },
      },
      text: TEXT,
    },
  ],
});
