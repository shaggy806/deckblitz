import { defineCard } from "../define.js";
import { entersTappedStatic, manaTapAbility } from "../helpers.js";

// EDHREC rank 16000. "This land and a creature you control" is an `each` of the
// source (`isSource: true`) and a creature, different permanents — an
// animated Great Hall pays only one of them.

const TEXT =
  "{W}{W}{B}, {T}, Sacrifice this land and a creature you control: Create a 4/4 white Angel Warrior creature token with flying and vigilance. Activate only as a sorcery.";

export default defineCard({
  name: "Great Hall of Starnheim",
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {B}.\n${TEXT}`,
  static: [entersTappedStatic("Great Hall of Starnheim")],
  activated: [
    manaTapAbility("B"),
    {
      cost: { mana: "{W}{W}{B}", tap: true, sacrifice: { each: [{ isSource: true }, { type: "creature" }] } },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token", token: "Angel Warrior Token (Flying, Vigilance)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
