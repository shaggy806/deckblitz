import { defineCard } from "../define.js";

const PT_TEXT = "Nameless One's power and toughness are each equal to the number of Wizards on the battlefield.";

export default defineCard({
  name: "Nameless One",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wizard", "Avatar"],
  power: 0,
  toughness: 0,
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: `${PT_TEXT}\nMorph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3): every Wizard, whoever
      // controls it, itself included.
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Wizard" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
