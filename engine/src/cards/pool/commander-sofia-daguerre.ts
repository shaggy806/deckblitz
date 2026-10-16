import { defineCard } from "../define.js";

// EDHREC rank 11442. Fallout.
//
// Cavalier of Dawn's shape: with no target chosen the ability does nothing
// (`target-chosen` keeps an empty `target-controller` from defaulting to
// you); a chosen target that survives the destroy (indestructible) still gets
// its controller a Junk token, and an illegal target stops the whole ability
// (the ruling).
const ENTER_TEXT =
  "Crash Landing — When Commander Sofia Daguerre enters, destroy up to one target legendary permanent. That permanent's controller creates a Junk token.";

export default defineCard({
  name: "Commander Sofia Daguerre",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 1,
  toughness: 3,
  keywords: ["flash"],
  text:
    "Flash\nCrash Landing — When Commander Sofia Daguerre enters, destroy up to one target legendary permanent. That permanent's controller creates a Junk token. (It's an artifact with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { supertype: "legendary" } } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target-chosen", index: 0 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "create-token", token: "Junk Token", count: 1, who: "target-controller" },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
