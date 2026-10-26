import { defineCard } from "../define.js";

export default defineCard({
  name: "Homura's Essence",
  art: "https://cards.scryfall.io/art_crop/front/8/4/84920a21-ee2a-41ac-a369-347633d10371.jpg",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "Creatures you control get +2/+2 and have flying and \"{R}: This creature gets +1/+0 until end of turn.\"",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: "{R}: This creature gets +1/+0 until end of turn.",
        },
      ],
      text: 'Creatures you control get +2/+2 and have flying and "{R}: This creature gets +1/+0 until end of turn."',
    },
  ],
  faces: ["Homura, Human Ascendant", "Homura's Essence"],
  flip: true,
});
