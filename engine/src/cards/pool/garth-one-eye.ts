import { defineCard } from "../define.js";

// EDHREC rank 10228.
//
// The name is chosen as the ability resolves (the ruling): a modal choice
// made then, among the names this Garth hasn't had chosen (`notChosenBefore`,
// per object — one that leaves and returns forgets, one that changes control
// remembers; nothing happens once all six have been). The copy is made
// outside the game from the Oracle card (rule 707.13) and cast as the ability
// resolves, timing ignored, its costs paid (rule 707.12, the rulings); one not
// cast is gone, and its name stays chosen. A permanent copy resolves into a
// token (rule 111.13).

const NAMES = ["Disenchant", "Braingeyser", "Terror", "Shivan Dragon", "Regrowth", "Black Lotus"] as const;
const TEXT =
  "{T}: Choose a card name that hasn't been chosen from among Disenchant, Braingeyser, Terror, Shivan Dragon, Regrowth, and Black Lotus. Create a copy of the card with the chosen name. You may cast the copy. (You still pay its costs.)";

export default defineCard({
  name: "Garth One-Eye",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 5,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        notChosenBefore: true,
        modes: NAMES.map((name) => ({
          text: name,
          effect: { kind: "cast-now", copyOfCardNamed: name, copyOutsideTheGame: true },
        })),
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
