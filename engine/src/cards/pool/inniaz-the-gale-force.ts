import { defineCard } from "../define.js";

// EDHREC rank 17261.
//
// The attack trigger: once per declaration however many fliers beyond the
// third attack (the ruling; `attack-with` `atLeast: 3`). You choose, for each
// player, one of their nonland permanents (`vote` `choose`, `who: "you"`,
// `about: "each-player"` — Winnowing's shape: one question per player, none
// for a player with nothing to choose), then each chosen permanent goes to the
// player to its controller's left, which is each player taking the one chosen
// from the player to their right: `rotate-control` `"right"` over `{ thisWay:
// "chosen" }`, all at once with one timestamp, for as long as the game lasts
// (the rulings). In a two-player game the two chosen permanents are
// exchanged; a player with no nonland permanent gives the player to their
// left nothing.

const PUMP_TEXT = "{2}{W/U}: Attacking creatures with flying get +1/+1 until end of turn.";
const ATTACK_TEXT =
  "Whenever three or more creatures you control with flying attack, each player gains control of a nonland permanent of your choice controlled by the player to their right.";

export default defineCard({
  name: "Inniaz, the Gale Force",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}\n${ATTACK_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W/U}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, keyword: "flying" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 3, filter: { keyword: "flying" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: "you",
            for: {
              permanent: { notTypes: ["land"] },
              about: "each-player",
              prompt: "Choose a nonland permanent for the player to its controller's left",
            },
          },
          { kind: "rotate-control", direction: "right", filter: { thisWay: "chosen" } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
