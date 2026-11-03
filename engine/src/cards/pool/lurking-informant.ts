import { defineCard } from "../define.js";

const ABILITY =
  "{2}, {T}: Look at the top card of target player's library. You may put that card into that player's graveyard.";

export default defineCard({
  name: "Lurking Informant",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 2,
  text: `({U/B} can be paid with either {U} or {B}.)\n${ABILITY}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["player"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
