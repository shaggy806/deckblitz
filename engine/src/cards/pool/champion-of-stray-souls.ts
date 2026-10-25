import { defineCard } from "../define.js";

// EDHREC rank 15014. "Sacrifice X other creatures" is Krav, the Unredeemed's
// sacrifice-X cost kept off the Champion by `otherOnly` (Voldaren Pariah); X
// is announced first, the X graveyard targets chosen before the cost is paid
// (its ruling), so a sacrificed creature is never among them. The second
// ability works only from the graveyard (Screaming Swarm's shape).
const RETURN_TEXT =
  "{3}{B}{B}, {T}, Sacrifice X other creatures: Return X target creature cards from your graveyard to the battlefield.";
const TOP_TEXT = "{5}{B}{B}: Put this card from your graveyard on top of your library.";

export default defineCard({
  name: "Champion of Stray Souls",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${RETURN_TEXT}\n${TOP_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: true, sacrifice: { filter: { type: "creature" }, count: "x" } },
      otherOnly: true,
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          min: "x",
          max: "x",
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      cost: { mana: "{5}{B}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: "top" },
      resolve: null,
      text: TOP_TEXT,
    },
  ],
});
