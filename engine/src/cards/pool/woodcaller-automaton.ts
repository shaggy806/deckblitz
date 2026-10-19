import { defineCard } from "../define.js";

// The Brothers' War. Prototype (rule 718): cast for {2}{G}{G} it's a green
// 3/3. "If you cast it" is an intervening-if on the source (cast by you). The
// land's base P/T is this creature's P/T as the trigger resolves, or as it
// last existed on the battlefield (the ruling) — `animate` reads a live amount
// once and keeps it (rule 608.2h). No duration is printed, so it stays a
// Treefolk for as long as it's on the battlefield.
const ENTERS_TEXT =
  "When this creature enters, if you cast it, untap target land you control. It becomes a Treefolk " +
  "creature with haste and base power and toughness equal to this creature's power and toughness. " +
  "It's still a land.";

export default defineCard({
  name: "Woodcaller Automaton",
  manaCost: "{10}",
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 8,
  toughness: 8,
  text:
    "Prototype {2}{G}{G} — 3/3 (You may cast this spell with different mana cost, color, and size. " +
    `It keeps its abilities and types.)\n${ENTERS_TEXT}`,
  prototype: { cost: "{2}{G}{G}", power: 3, toughness: 3 },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: ["land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "animate",
            target: 0,
            power: { powerOf: "source" },
            toughness: { toughnessOf: "source" },
            addTypes: ["creature"],
            addSubtypes: ["Treefolk"],
            keywords: ["haste"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
