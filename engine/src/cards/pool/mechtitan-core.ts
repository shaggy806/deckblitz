import { defineCard } from "../define.js";

// The cost exiles the Vehicle (its `do`), then the four others, chosen as it's paid and linked to
// it (rule 607.2a) — craft's materials on the battlefield alone (`permanentsOnly`), no craft.
// "When that token leaves the battlefield" is a delayed trigger made with the token (rule 603.7);
// it returns the cards linked to the Core, which never include the Core itself ("except this
// card"), tapped, under their owners' control.
const MECHTITAN =
  "{5}, Exile this Vehicle and four other artifact creatures and/or Vehicles you control: Create Mechtitan, a legendary 10/10 Construct artifact creature token with flying, vigilance, trample, lifelink, and haste that's all colors. When that token leaves the battlefield, return all cards exiled with this Vehicle except this card to the battlefield tapped under their owners' control.";

export default defineCard({
  name: "Mechtitan Core",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 4,
  text: `${MECHTITAN}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [
    {
      cost: {
        mana: "{5}",
        tap: false,
        do: { kind: "exile", target: "source" },
        craft: {
          count: 4,
          permanentsOnly: true,
          filter: { anyOf: [{ types: ["artifact", "creature"] }, { subtype: "Vehicle" }] },
          text: "four other artifact creatures and/or Vehicles you control",
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Mechtitan Token", count: 1 },
          {
            kind: "delayed-trigger",
            at: { leaves: "created", to: ["graveyard", "exile", "hand", "library", "command"] },
            effect: { kind: "return-exiled-by-source", linked: "battlefield", enterTapped: true },
            text: "When that token leaves the battlefield, return all cards exiled with this Vehicle except this card to the battlefield tapped under their owners' control.",
          },
        ],
      },
      resolve: null,
      text: MECHTITAN,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
});
