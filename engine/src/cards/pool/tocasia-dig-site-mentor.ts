import { defineCard } from "../define.js";

// EDHREC rank 19227.

const GRANT_TEXT =
  'Creatures you control have vigilance and "{T}: Surveil 1." (To surveil 1, look at the top card of your library. You may put that card into your graveyard.)';
const RETURN_TEXT =
  "{2}{G}{G}{W}{W}{U}{U}, Exile this card from your graveyard: Return any number of target artifact cards with total mana value 10 or less from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Tocasia, Dig Site Mentor",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 4,
  toughness: 3,
  text: `${GRANT_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["vigilance"],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "surveil", amount: 1 },
          resolve: null,
          text: "{T}: Surveil 1.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}{G}{W}{W}{U}{U}", tap: false },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } },
          maxTotalManaValue: 10,
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
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
