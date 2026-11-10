import { defineCard } from "../define.js";

// EDHREC rank 6032.
//
// Rulings:
//   [2006-09-25] Removing the other Dragon card from your graveyard has no effect on Scion of
//     the Ur-Dragon.
//   [2006-09-25] When Scion of the Ur-Dragon becomes a copy of another Dragon, it loses its
//     copy ability for the rest of the turn.
//
// The search's `then` sees the find as its slot 0. "If you do": only a card
// that reached the graveyard is copied — one a replacement sent elsewhere
// (Rest in Peace) isn't. It copies the *card* (rule 707.2: its printed
// values), until the cleanup step, with no exception: the copy has no copy
// ability. "A Dragon permanent card" leaves out a kindred instant or sorcery
// with changeling.
const TEXT =
  "{2}: Search your library for a Dragon permanent card and put it into your graveyard. If you do, Scion of the Ur-Dragon becomes a copy of that card until end of turn. Then shuffle.";

export default defineCard({
  name: "Scion of the Ur-Dragon",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Avatar"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Dragon", notTypes: ["instant", "sorcery"] },
        destination: "graveyard",
        min: 0,
        max: 1,
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { inZone: "graveyard" } },
          then: { kind: "become-copy", target: "source", of: 0, ofCard: true, until: "end-of-turn" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
