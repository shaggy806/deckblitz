import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, create two 2/2 black Zombie creature tokens with decayed. When you do, exile up to two target cards from graveyards.";

export default defineCard({
  name: "Diregraf Horde",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 4,
  text: `${TEXT} (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 2 },
          {
            // A reflexive ability (rule 603.12): it targets as it goes on the
            // stack once this one has finished resolving.
            kind: "conditional",
            condition: { kind: "this-way", what: "created", filter: { subtype: "Zombie" } },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2 }],
              effect: {
                kind: "for-each-target",
                from: 0,
                effect: { kind: "exile", target: 0 },
                simultaneous: true,
              },
              text: "When you do, exile up to two target cards from graveyards.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
