import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// Arabian Nights. "This does not stop sacrifices" (the ruling): the
// indestructible grant stops only destruction, and a sacrifice changes no
// control.

const TEXT =
  "As long as this creature is untapped, noncreature artifacts you control can't be enchanted, they have indestructible, and other players can't gain control of them. This effect doesn't remove Auras already attached to those artifacts.";

const ARTIFACTS: CardFilter = { type: "artifact", notTypes: ["creature"], controlledBy: "you" };
const UNTAPPED = { kind: "source", filter: { tapped: false } } as const;

export default defineCard({
  name: "Guardian Beast",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: ARTIFACTS },
      condition: UNTAPPED,
      grantKeywords: ["indestructible"],
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      condition: UNTAPPED,
      prohibits: [
        { act: "be-attached", attachment: "aura", keepsAttached: true, object: ARTIFACTS },
        { act: "gain-control", by: "others", object: ARTIFACTS },
      ],
      text: TEXT,
    },
  ],
});
