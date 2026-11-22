import { defineCard } from "../define.js";

// Dominaria Remastered (DMR). EDHREC rank 21614.
//
// The enters trigger is Planetary Annihilation's keep-the-chosen shape
// (`sacrifice-all-but`, `upTo`) asked from its controller around the table
// (`startingWithYou`), with what wasn't chosen phasing out instead of being
// sacrificed (`rest: "phase-out"`), all at once and the Disciple itself
// spared (`exceptSource`). What's attached to a permanent that phases out
// goes with it (rule 702.26g), and an Aura or Equipment chosen on a creature
// that wasn't stays (phasing out directly only what wasn't chosen).
//
// "Permanents can't phase in" is a `phase-in` prohibition over every object:
// it holds anything phased out, however it got there, for as long as the
// Disciple is on the battlefield; a phased-out Disciple's static does nothing
// (rule 702.26b), so the others may phase in then (the rulings).
//
// Rulings:
//   [2022-10-14] The last ability means that no permanents phase in under any player's control
//     as long as Disciple of Caelus Nin is on the battlefield. This includes permanents that
//     phase out in ways other than the first ability, and even permanents that are phased out
//     already when it enters the battlefield. Once it leaves the battlefield, each phased out
//     permanent will phase in normally during its controller's untap step, with one exception.
//   [2022-10-14] If Disciple of Caelus Nin itself phases out, other phased out permanents can
//     phase back in normally while it is phased out. During its controller's untap step,
//     Caelus Nin and all other phased out permanents that player controls phase in at the same
//     time.

const ENTERS_TEXT =
  "When this creature enters, starting with you, each player chooses up to five permanents they control. All permanents other than this creature that weren't chosen this way phase out.";
const STATIC_TEXT = "Permanents can't phase in.";

export default defineCard({
  name: "Disciple of Caelus Nin",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: ENTERS_TEXT + "\n" + STATIC_TEXT,
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "phase-in", object: {} }], text: STATIC_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice-all-but",
        who: "each-player",
        keep: 5,
        filter: {},
        upTo: true,
        startingWithYou: true,
        rest: "phase-out",
        exceptSource: true,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
