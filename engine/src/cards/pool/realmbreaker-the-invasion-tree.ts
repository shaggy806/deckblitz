import { defineCard } from "../define.js";

// EDHREC rank 4286. The land is chosen from the target's whole graveyard, just
// milled or already there (the ruling), and put under your control with the
// Geth's "exile instead" ability on it.

const MILL_TEXT =
  "{2}, {T}: Target opponent mills three cards. Put a land card from their graveyard onto the battlefield tapped under your control. It gains \"If this land would leave the battlefield, exile it instead of putting it anywhere else.\"";
const SAC_TEXT = "{10}, {T}, Sacrifice Realmbreaker: Search your library for any number of Praetor cards, put them onto the battlefield, then shuffle.";

export default defineCard({
  name: "Realmbreaker, the Invasion Tree",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${MILL_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            from: { target: 0 },
            min: 1,
            max: 1,
            filter: { type: "land" },
            destination: "stay",
            leftover: "stay",
            then: { kind: "put-onto-battlefield", target: 0, underYourControl: true, enterTapped: true, exileIfItWouldLeave: "ability" },
          },
        ],
      },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      cost: { mana: "{10}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Praetor" }, destination: "battlefield", min: 0, max: { librarySize: "you" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
