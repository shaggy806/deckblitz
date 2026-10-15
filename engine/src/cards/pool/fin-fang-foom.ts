import { defineCard } from "../define.js";

// EDHREC rank 20023.
//
// The spell's targets are read as it's cast (a cast-spell `targets` filter):
// one artifact or land among them is enough. The copy isn't optional, and
// the counters come after it's made.
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell that targets an artifact or land, copy that spell. You may choose new targets for the copy. Put two +1/+1 counters on Fin Fang Foom.";

export default defineCard({
  name: "Fin Fang Foom",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Dragon", "Villain"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          typesAnyOf: ["instant", "sorcery"],
          targets: { permanent: { typesAnyOf: ["artifact", "land"] } },
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "copy-spell", target: "trigger-spell", newTargets: true },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
