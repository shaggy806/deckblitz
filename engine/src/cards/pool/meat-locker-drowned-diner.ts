import { roomCard } from "../helpers.js";
import left from "./meat-locker.js";
import right from "./drowned-diner.js";

// EDHREC rank 8727. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a
// sorcery.
export default roomCard("Meat Locker // Drowned Diner", left, right);
