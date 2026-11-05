import { defineCard } from "../define.js";

const PLAY = "{W}{U}{B}{R}{G}: You may play target Elemental card from your graveyard without paying its mana cost.";

export default defineCard({
  name: "Horde of Notions",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "trample", "haste"],
  text: `Vigilance, trample, haste\n${PLAY}`,
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Elemental" } }],
      // "Play": a land card would be played (with a land play left); a free
      // cast allows no alternative cost such as evoke (the ruling).
      effect: { kind: "cast-now", target: 0, free: true, play: true },
      resolve: null,
      text: PLAY,
    },
  ],
});
