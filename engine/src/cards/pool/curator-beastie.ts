import { defineCard } from "../define.js";

// EDHREC rank 6814.
//
// Rulings (abridged):
//   If Curator Beastie enters under your control at the same time as one or more colorless
//     creatures, those colorless creatures won't enter with additional +1/+1 counters.
//   The face-down card put onto the battlefield by Curator Beastie's last ability is a
//     colorless creature you control entering the battlefield (unless an effect gives it a
//     color) so it will enter with +1/+1 counters if Curator Beastie is still on the
//     battlefield.
//   If your library contains only one card when you manifest dread, you'll look at that card
//     and put it onto the battlefield face down. If your library contains no cards when you
//     manifest dread, you won't do anything.
//
// An `others-enter-battlefield` replacement over colourless creatures, judged
// as they'll exist on the battlefield (rule 614.12): a manifested card is
// turned face down before it enters, so it's the colourless 2/2 the ruling
// says and gets the counters. "Whenever this creature enters or attacks" is
// two entries, one per event (Colossal Grave-Reaver).

const REACH = "Reach";
const COUNTERS = "Colorless creatures you control enter with two additional +1/+1 counters on them.";
const DREAD =
  "Whenever this creature enters or attacks, manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Curator Beastie",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["reach"],
  text: `${REACH}\n${COUNTERS}\n${DREAD}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", colorless: true, controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 2 },
      },
      text: COUNTERS,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: DREAD,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: DREAD,
    },
  ],
});
