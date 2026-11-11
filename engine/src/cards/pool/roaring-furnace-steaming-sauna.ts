import { roomCard } from "../helpers.js";
import left from "./roaring-furnace.js";
import right from "./steaming-sauna.js";

// EDHREC rank 7291. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a sorcery.
export default roomCard("Roaring Furnace // Steaming Sauna", left, right);
