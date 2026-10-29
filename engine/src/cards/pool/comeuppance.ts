import { defineCard } from "../define.js";

// EDHREC rank 2990.
//
// Two prevention rules over the same recipients, split by whether the source
// is a creature as the damage would be dealt (rule 615.1) — disjoint, so
// together they prevent exactly what the card's one rule does. Each one's
// additional effect (615.5) is Comeuppance's own damage: to the creature
// source itself, or to the noncreature source's controller. Not a
// redirection, and never combat damage (the ruling).

const TO = { players: "you", permanents: { type: "planeswalker", controlledBy: "you" } } as const;

export default defineCard({
  name: "Comeuppance",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to you and planeswalkers you control this turn by sources you don't control. If damage from a creature source is prevented this way, Comeuppance deals that much damage to that creature. If damage from a noncreature source is prevented this way, Comeuppance deals that much damage to the source's controller.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage-rule",
        to: TO,
        by: { filter: { type: "creature", controlledBy: "opponent" } },
        then: { kind: "damage", amount: "x", target: "trigger-object" },
      },
      {
        kind: "damage-rule",
        to: TO,
        by: { filter: { notTypes: ["creature"], controlledBy: "opponent" } },
        then: { kind: "damage", amount: "x", who: "trigger-controller" },
      },
    ],
  },
});
