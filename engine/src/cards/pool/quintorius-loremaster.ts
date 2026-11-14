import { defineCard } from "../define.js";

// EDHREC rank 8728.
//
// The end-step exile is linked to Quintorius (rule 607.2a, `linked`), so the
// activated ability's "target card exiled with Quintorius" is the cards it
// exiled in this stint. The permission rides on that card for the turn
// (`grant-play`), free, and a spell cast under it carries `bottomAfter`: put
// on the bottom of its owner's library instead of into a graveyard — only
// while it's a spell (a permanent it became goes to the graveyard as usual).
const END_TEXT =
  "At the beginning of your end step, exile target noncreature, nonland card from your graveyard. Create a 3/2 red and white Spirit creature token.";
const CAST_TEXT =
  "{1}{R}{W}, {T}, Sacrifice a Spirit: Choose target card exiled with Quintorius. You may cast that card this turn without paying its mana cost. If that spell would be put into a graveyard, put it on the bottom of its owner's library instead.";

export default defineCard({
  name: "Quintorius, Loremaster",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${END_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["creature", "land"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          { kind: "create-token", token: "Spirit Token (Red-White)", count: 1 },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}{W}", tap: true, sacrifice: { filter: { subtype: "Spirit" } } },
      targets: [{ kind: "card-in-exile", linked: true }],
      effect: { kind: "grant-play", cards: 0, duration: "end-of-turn", free: true, bottomAfter: true },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
