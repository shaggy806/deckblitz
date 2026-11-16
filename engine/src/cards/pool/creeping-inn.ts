import { defineCard } from "../define.js";

// The back face of Hostile Hostel. "Exiled with this creature" are the cards
// its attack trigger exiled, linked to it (rule 607.2a — `look-and-choose`'s
// `"exile"` destination), in this stint: phasing out and in keeps them (the
// ruling), a new object after a zone change starts over. X counts the one just
// exiled too.
const ATTACK_TEXT =
  "Whenever this creature attacks, you may exile a creature card from your graveyard. If you do, each opponent loses X life and you gain X life, where X is the number of creature cards exiled with this creature.";
const PHASE_TEXT = "{4}: This creature phases out.";
const X = { aggregate: "count", filter: { type: "creature" }, in: "exiled-with-source" } as const;

export default defineCard({
  name: "Creeping Inn",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Horror", "Construct"],
  power: 3,
  toughness: 7,
  text: `${ATTACK_TEXT}\n${PHASE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile a creature card from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              filter: { type: "creature" },
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "lose-life", who: "each-opponent", amount: X },
                  { kind: "gain-life", amount: X },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: PHASE_TEXT,
    },
  ],
  faces: ["Hostile Hostel", "Creeping Inn"],
  transform: true,
});
