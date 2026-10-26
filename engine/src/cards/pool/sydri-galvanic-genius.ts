import { defineCard } from "../define.js";

// EDHREC rank 14862. The animated artifact keeps its types and subtypes and
// gains creature (it's already an artifact); its P/T is its mana value as
// the ability resolves, fixed from then (rule 608.2h).

export default defineCard({
  name: "Sydri, Galvanic Genius",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: "{U}: Target noncreature artifact becomes an artifact creature with power and toughness each equal to its mana value until end of turn.\n{W}{B}: Target artifact creature gains deathtouch and lifelink until end of turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "animate",
        target: 0,
        power: { manaValueOf: 0 },
        toughness: { manaValueOf: 0 },
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{U}: Target noncreature artifact becomes an artifact creature with power and toughness each equal to its mana value until end of turn.",
    },
    {
      cost: { mana: "{W}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{W}{B}: Target artifact creature gains deathtouch and lifelink until end of turn.",
    },
  ],
});
