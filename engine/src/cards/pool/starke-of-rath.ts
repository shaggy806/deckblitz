import { defineCard } from "../define.js";

// EDHREC rank 18495. "That permanent's controller" is read as the destroyed
// permanent last existed on the battlefield, so it still gains control of
// Starke whether or not the permanent was destroyed (regenerated,
// indestructible).

const TEXT =
  "{T}: Destroy target artifact or creature. That permanent's controller gains control of Starke. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Starke of Rath",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["artifact-or-creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "gain-control", target: "source", untilEndOfTurn: false, who: { controllerOfTarget: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
