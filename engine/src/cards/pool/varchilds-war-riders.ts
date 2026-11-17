import { defineCard } from "../define.js";
import { cumulativeUpkeep, rampage } from "../helpers.js";

// EDHREC rank 13546.
//
// "Have an opponent create a 1/1 red Survivor creature token" once per age
// counter, an opponent chosen for each (rule 702.24a: "each choice is made
// separately for each age counter"), so the tokens may go to different
// players (its ruling); with one opponent nobody is asked. The chosen
// opponent creates the token, so owns and controls it.

const upkeep = cumulativeUpkeep({
  doing: { kind: "choose-opponent", then: { kind: "create-token", token: "Survivor Token", count: 1, who: "that-player" } },
  text: "Have an opponent create a 1/1 red Survivor creature token",
});
const ramp = rampage(1);

export default defineCard({
  name: "Varchild's War-Riders",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: `${upkeep.text}\nTrample; ${ramp.text}`,
  triggered: [upkeep, ramp],
});
