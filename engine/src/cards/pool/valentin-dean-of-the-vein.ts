import { defineCard } from "../define.js";

// The front face of a modal double-faced card (Valentin // Lisette). Each
// creature the replacement exiles fires its own "when you do" (Head of the
// Hunt's shape), which offers the {2}.
const EXILE =
  'If a nontoken creature an opponent controls would die, exile it instead. When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with "When this token dies, you gain 1 life."';

export default defineCard({
  name: "Valentin, Dean of the Vein",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 1,
  toughness: 1,
  keywords: ["menace", "lifelink"],
  text: `Menace, lifelink\n${EXILE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent", token: false },
        then: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "may",
            prompt: "Pay {2} to create a Pest token?",
            cost: "{2}",
            effect: { kind: "create-token", token: "Pest Token", count: 1 },
          },
          text: "When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token.",
        },
      },
      text: EXILE,
    },
  ],
  faces: ["Valentin, Dean of the Vein", "Lisette, Dean of the Root"],
});
