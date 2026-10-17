import { defineCard } from "../define.js";
import { demonstrate } from "../helpers.js";

// EDHREC rank 7464.
//
// Rulings:
//   [2023-10-13] This means that if you cast a spell with demonstrate and both you and an opponent
//     copy it, the opponent's copy will resolve first, then your copy will resolve, and finally
//     the original spell will resolve.
//   [2023-10-13] You choose whether to make a copy as the demonstrate ability resolves. This
//     happens before the original spell resolves. Your copy goes on the stack above the original
//     spell.
//   [2023-10-13] If you cast the spell and choose not to copy it, no opponent will get to copy it
//     either.
//   [2023-10-13] If any additional or alternative costs were paid to cast the spell with
//     demonstrate, the copies will see those choices as well.
//   [2023-10-13] If the spell had an X value chosen for it as it was cast, the copies will have
//     the same value of X.
//   [2023-10-13] If the spell with demonstrate had any modes chosen for it as it was cast, the
//     copies will have the same modes chosen for it.
//
// The granted demonstrate is Maelstrom Nexus's `grantsToSpells` with
// `firstEachTurn`, narrowed by a filter for "cast from anywhere other than your
// hand" (Alex Wilder, Runaway's `anyOf` over every other zone a spell is cast
// from). `firstEachTurn` reads the turn's cast records, each as it was cast,
// so a spell cast from exile before the Doctor arrived still was the first.
// The +1/+1 counter is Kalamax's `copyOnly` trigger, unfiltered: your own
// demonstrate copy counts, the opponent's (theirs, not yours) doesn't.
const DEMONSTRATE_TEXT =
  "The first spell you cast from anywhere other than your hand each turn has demonstrate. (When you cast that spell, you may copy it. If you do, choose an opponent to also copy it. A copy of a permanent spell becomes a token.)";
const COUNTER_TEXT = "Whenever you copy a spell, put a +1/+1 counter on The Twelfth Doctor.";

export default defineCard({
  name: "The Twelfth Doctor",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 4,
  toughness: 4,
  text: `${DEMONSTRATE_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        filter: {
          anyOf: [{ castFrom: "graveyard" }, { castFrom: "exile" }, { castFrom: "library" }, { castFrom: "command" }],
        },
        firstEachTurn: true,
        triggered: [demonstrate()],
      },
      text: DEMONSTRATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", copyOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
