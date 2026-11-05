import { defineCard } from "../define.js";

// EDHREC rank 8477.
// Makes Mutagen → use "Mutagen Token".

export default defineCard({
  name: "Splinter, the Mentor",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Rat"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  pairing: { kind: "partner-group", group: "Character select" },
  text: "Menace\nWhenever Splinter or another nontoken creature you control leaves the battlefield, create a Mutagen token.\nPartner—Character select (You can have two commanders if both have this ability.)",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "Whenever Splinter or another nontoken creature you control leaves the battlefield, create a Mutagen token.",
    },
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "Whenever Splinter or another nontoken creature you control leaves the battlefield, create a Mutagen token.",
    },
  ],
});
