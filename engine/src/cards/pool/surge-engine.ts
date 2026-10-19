import { defineCard } from "../define.js";

// EDHREC rank 16419. The Brothers' War.
// Rulings:
//   If a Surge Engine whose last ability has been activated leaves the battlefield and comes
//   back, it's a new object on the battlefield and its last ability can be activated again
//   (once it's blue, of course).
//   Surge Engine's last ability can be activated only once per game, not once per turn.
//   If Surge Engine loses defender in some way other than its first ability, its second ability
//   may still be activated. Likewise, if it becomes blue in some way other than its second
//   ability, its last ability may still be activated. Note that an effect that allows a
//   creature to "attack as though it didn't have defender" doesn't actually cause it to lose
//   defender.

const UNBLOCKABLE_TEXT = "{U}: This creature loses defender and gains \"This creature can't be blocked.\"";
const BLUE_TEXT =
  "{2}{U}: This creature becomes blue and has base power and toughness 5/4. Activate only if this creature doesn't have defender.";
const DRAW_TEXT = "{4}{U}{U}: Draw three cards. Activate only if this creature is blue and only once.";

export default defineCard({
  name: "Surge Engine",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender\n${UNBLOCKABLE_TEXT}\n${BLUE_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      // No duration: for as long as it's on the battlefield.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "permanent" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "permanent" },
        ],
      },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
    {
      cost: { mana: "{2}{U}", tap: false },
      // Whether it has defender however it lost it (the ruling) — read off
      // its current keywords.
      condition: { kind: "source", filter: { notKeyword: "defender" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 4,
        addTypes: [],
        addSubtypes: [],
        setColors: ["U"],
        duration: "permanent",
      },
      resolve: null,
      text: BLUE_TEXT,
    },
    {
      cost: { mana: "{4}{U}{U}", tap: false },
      // Blue however it got there (the ruling). "Only once": once for as
      // long as this object exists (Duggan's `exhaust` bookkeeping), so a
      // Surge Engine that leaves and comes back may again.
      condition: { kind: "source", filter: { colors: ["U"] } },
      exhaust: true,
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
