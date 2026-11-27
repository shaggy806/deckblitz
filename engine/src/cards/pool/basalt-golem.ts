import { defineCard } from "../define.js";

// EDHREC rank 26259.
//
// One trigger per blocking creature (rule 509.3c's "becomes blocked by a
// creature"), each setting up its own delayed sacrifice at end of combat
// (rule 603.7). The blocker's controller sacrifices it (`byItsController`);
// only if they did — it was still that creature on the battlefield — do they
// create the Wall (the ruling), "they" being who controlled it as it was
// sacrificed, read as it last existed (608.2h).
const UNBLOCKABLE = "This creature can't be blocked by artifact creatures.";
const TEXT =
  "Whenever this creature becomes blocked by a creature, that creature's controller sacrifices it at end of combat. If the player does, they create a 0/2 colorless Wall artifact creature token with defender.";

export default defineCard({
  name: "Basalt Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 4,
  text: `${UNBLOCKABLE}\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { type: "artifact" } }],
      text: UNBLOCKABLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-target", target: "trigger-object", byItsController: true },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed" },
              then: {
                kind: "create-token",
                token: "Wall Token (Basalt Golem)",
                count: 1,
                who: { controllerOf: "trigger-object" },
              },
            },
          ],
        },
        text: "That creature's controller sacrifices it. If the player does, they create a 0/2 colorless Wall artifact creature token with defender.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
