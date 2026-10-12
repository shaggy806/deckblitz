import { defineCard } from "../define.js";

// EDHREC rank 12077.
//
// "You may tap three untapped creatures you control. If you do, copy that
// spell": offered only while you control three untapped creatures (Aziza
// among them — tapping isn't a {T} cost, so summoning sickness doesn't
// matter), and then exactly three are tapped (Myr Battlesphere's
// choose-permanents) before the copy. Swarm Intelligence's copy otherwise:
// "trigger-spell" copies the spell as it last was on the stack, so the copy
// is made even if the spell was countered in response (the ruling).
const UNTAPPED_CREATURE = { type: "creature", tapped: false, controlledBy: "you" } as const;
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell, you may tap three untapped creatures you control. If you do, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Aziza, Mage Tower Captain",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Djinn", "Sorcerer"],
  power: 2,
  toughness: 2,
  text: COPY_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: UNTAPPED_CREATURE, atLeast: 3 },
        then: {
          kind: "may",
          prompt: "Tap three untapped creatures you control to copy that spell?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "choose-permanents",
                filter: UNTAPPED_CREATURE,
                min: 3,
                upTo: 3,
                then: { kind: "tap", target: 0 },
                prompt: "Tap three untapped creatures you control",
              },
              { kind: "copy-spell", target: "trigger-spell", newTargets: true },
            ],
          },
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
