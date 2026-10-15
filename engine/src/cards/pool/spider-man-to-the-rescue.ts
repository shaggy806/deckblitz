import { defineCard } from "../define.js";

// EDHREC rank 16462.
//
// "When you do" needs him actually tapped (rule 603.12): already tapped, or
// gone, he can't be, and nothing follows — the `this-way` tapped check. The
// reflexive trigger targets as it goes on the stack.

const RESCUE_TEXT =
  "No One Dies! — When Spider-Man enters, you may tap him. When you do, another target nonattacking creature you control gains indestructible until end of turn.";

export default defineCard({
  name: "Spider-Man, To the Rescue",
  manaCost: "{2}{G/W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "reach", "vigilance"],
  text: `Flash\nReach, vigilance\n${RESCUE_TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Tap Spider-Man to give another nonattacking creature you control indestructible?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "tapped" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  {
                    kind: "other",
                    of: { kind: "permanent", whose: "you", filter: { type: "creature", attacking: false } },
                  },
                ],
                effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
                text: "When you do, another target nonattacking creature you control gains indestructible until end of turn.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: RESCUE_TEXT,
    },
  ],
});
