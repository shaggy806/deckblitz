import { defineCard } from "../define.js";

// EDHREC rank 13244.
//
// Rulings:
//   - Any enters-the-battlefield abilities of the copied creature will trigger when the token
//     enters the battlefield. Any "as [this creature] enters the battlefield" or "[this creature]
//     enters the battlefield with" abilities of the chosen creature will also work.
//   - The Eleventh Hour's first ability can find any card with the Doctor creature type, not
//     cards with the word "Doctor" in the name.
//   - The same is true for reducing the cost of Doctor spells.
//   - Except for its name and types, the token copies exactly what was printed on the original
//     creature and nothing else (unless that permanent is copying something else or it is a
//     token; see below). It doesn't copy whether that creature is tapped or untapped, whether it
//     has any counters on it or Auras and Equipment attached to it, and so on.
//   - The token will still have any card types it normally has, such as creature or artifact, but
//     it will lose any non-Alien subtypes it has, such as Human or Vehicle.
//   - If the copied creature is a token, the new token that's created copies the original
//     characteristics of that token as stated by the effect that created that token, with the
//     exceptions noted above.
//   - If the copied creature has {X} in its mana cost, X is considered to be 0.
//   - If the copied creature is copying something else, then the token enters the battlefield as
//     whatever that creature copied, with the exceptions noted above.
//
// III's "a legendary Alien" replaces every subtype, of every kind (the ruling), its card types
// kept: `setAllSubtypes`, part of the copiable values (rule 707.9b) with the name and supertype.

export default defineCard({
  name: "The Eleventh Hour",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Search your library for a Doctor card, reveal it, put it into your hand, then shuffle.\nII — Create a Food token and a 1/1 white Human creature token with \"Doctor spells you cast cost {1} less to cast.\"\nIII — Create a token that's a copy of target creature, except it's a legendary Alien named Prisoner Zero.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Doctor" }, destination: "hand", min: 0, max: 1, reveal: true },
      resolve: null,
      text: "I — Search your library for a Doctor card, reveal it, put it into your hand, then shuffle.",
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Food Token", count: 1 },
          { kind: "create-token", token: "Human Token (Doctor spells you cast cost {1} less)", count: 1 },
        ],
      },
      resolve: null,
      text: "II — Create a Food token and a 1/1 white Human creature token with \"Doctor spells you cast cost {1} less to cast.\"",
    },
    {
      at: [3],
      targets: ["creature"],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        exceptions: { addSupertypes: ["legendary"], setAllSubtypes: ["Alien"], name: "Prisoner Zero" },
      },
      resolve: null,
      text: "III — Create a token that's a copy of target creature, except it's a legendary Alien named Prisoner Zero.",
    },
  ],
});
