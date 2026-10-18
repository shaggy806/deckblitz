import { defineCard } from "../define.js";

// EDHREC rank 20647.
//
// The returned creature's "if this creature would leave the battlefield, exile it instead" is
// Whip of Erebos's `put-onto-battlefield { exileIfItWouldLeave }`.

const ANTHEM_TEXT = "Other creatures you control get -1/-1.";
const RETURN_TEXT =
  "{1}{B}{B}, {T}: Return target creature card from your graveyard to the battlefield. It gains \"If this creature would leave the battlefield, exile it instead of putting it anywhere else.\" Activate only as a sorcery.";

export default defineCard({
  name: "Geth, Thane of Contracts",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 3,
  toughness: 4,
  text: `${ANTHEM_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}{B}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, exileIfItWouldLeave: true },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [-1, -1],
      text: ANTHEM_TEXT,
    },
  ],
});
