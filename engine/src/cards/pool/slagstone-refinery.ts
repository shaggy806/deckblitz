import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 8519.
//
// Rulings:
//   [2022-10-14] If Slagstone Refinery is put into a graveyard from the battlefield or exiled
//     from the battlefield at the same time that one or more other nontoken artifacts controlled
//     by the same player are put into a graveyard from the battlefield and/or exiled from the
//     battlefield, its triggered ability will trigger once for each of them plus once for itself.
//
// "This artifact or another nontoken artifact you control" is the two
// triggers `thisOrAnother` makes: the Refinery itself, whatever it is by then
// (a token copy of it included), and every other nontoken artifact you
// controlled as it left (rule 603.10a looks back — so a simultaneous leave
// triggers once per artifact, plus once for itself: the ruling).

const TEXT =
  "Whenever this artifact or another nontoken artifact you control is put into a graveyard from the battlefield or is put into exile from the battlefield, create a tapped Powerstone token.";

export default defineCard({
  name: "Slagstone Refinery",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (It's an artifact with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")`,
  triggered: thisOrAnother({
    trigger: {
      on: "leaves-battlefield",
      who: "you-control",
      filter: { type: "artifact", token: false },
      to: ["graveyard", "exile"],
    },
    targets: [],
    effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
    resolve: null,
    text: TEXT,
  }),
});
