import { roomCard } from "../helpers.js";
import left from "./polluted-cistern.js";
import right from "./dim-oubliette.js";

// EDHREC rank 6887. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a
// sorcery.
export default roomCard("Polluted Cistern // Dim Oubliette", left, right);
