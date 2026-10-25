/**
 * Commander 2016 and Kaladesh, group B: the clause of each card most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const energy = (game: Game, player = A): number => game.state.players[player].energy;
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
/** A Vehicle becomes an artifact creature until end of turn, as crewing would. */
const animate = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [ref(id)]);

describe("C16 / KLD group B", () => {
  it("Ancient Excavation draws the hand's size (not counting itself), then discards that many", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const excavation = toHand(game, "Ancient Excavation");
    const n = hand(game).length - 1;
    cast(game, excavation);
    expect(hand(game).length).toBe(n);
    expect(graveyard(game).length).toBe(n + 1);
  });

  it("Ludevic: the active player may draw at their end step only if someone other than Ludevic's controller lost life", () => {
    const { game, a, b } = table();
    spawn(game, "Ludevic, Necro-Alchemist");
    pickModes(a, 0);
    pickModes(b, 0);
    // Only Ludevic's controller lost life: no draw.
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "you" }, []);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
    // Bob's turn: Bob lost life, so Bob (the active player) may draw.
    nextTurn(game);
    const bobBefore = hand(game, B).length;
    const aliceBefore = hand(game).length;
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" }, []);
    toStep(game, "end", B);
    settle(game);
    expect(hand(game, B).length).toBe(bobBefore + 1);
    expect(hand(game).length).toBe(aliceBefore);
  });

  it("Grip of Phyresis steals an Equipment and attaches it to a new Germ", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const scimitar = spawn(game, "Leonin Scimitar", B);
    cast(game, toHand(game, "Grip of Phyresis"), { targets: [ref(scimitar)] });
    expect(controller(game, scimitar)).toBe(A);
    expect(tokensNamed(game, "Phyrexian Germ Token", A)).toBe(1);
    const germ = named(game, "Phyrexian Germ Token", A)[0];
    expect(game.state.objects[scimitar].attachedTo).toBe(germ);
    expect(pt(game, germ)).toEqual({ power: 1, toughness: 1 });
  });

  it("Wildest Dreams returns exactly X target cards and exiles itself", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Shock");
    const dreams = toHand(game, "Wildest Dreams");
    cast(game, dreams, { x: 2, targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, dreams)).toBe("exile");
  });

  it("Depala: paying X as it becomes tapped takes every Dwarf and Vehicle among the top X", () => {
    const { game } = table();
    const depala = spawn(game, "Depala, Pilot Exemplar");
    lands(game, "Mountain", 3);
    const cruiser = toLibrary(game, "Fleetwheel Cruiser");
    const bears = toLibrary(game, "Grizzly Bears");
    const mechanic = toLibrary(game, "Aviary Mechanic");
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(depala)]);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    settle(game);
    expect(zone(game, mechanic)).toBe("hand");
    expect(zone(game, cruiser)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
  });

  it("Depala pumps other Dwarves, and a Vehicle only while it's a creature", () => {
    const { game } = table();
    const depala = spawn(game, "Depala, Pilot Exemplar");
    const mechanic = spawn(game, "Aviary Mechanic");
    const cruiser = spawn(game, "Fleetwheel Cruiser");
    expect(pt(game, depala)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, mechanic)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, cruiser)).toEqual({ power: 5, toughness: 3 });
    animate(game, cruiser);
    expect(pt(game, cruiser)).toEqual({ power: 6, toughness: 4 });
  });

  it("Fleetwheel Cruiser is a hasty creature the turn it enters", () => {
    const { game, a } = table();
    const cruiser = enter(game, "Fleetwheel Cruiser");
    expect(types(game, cruiser)).toContain("creature");
    attack(game, a, [cruiser]);
    expect(life(game, B)).toBe(15);
  });

  it("Ovalchase Daredevil returns from the graveyard when an artifact enters under your control", () => {
    const { game, a } = table();
    const daredevil = toGraveyard(game, "Ovalchase Daredevil");
    pickModes(a, 0);
    enter(game, "Ornithopter", B);
    expect(zone(game, daredevil)).toBe("graveyard");
    enter(game, "Ornithopter");
    expect(zone(game, daredevil)).toBe("hand");
  });

  it("Janjeet Sentry pays two energy to untap a creature", () => {
    const { game, a } = table();
    const sentry = enter(game, "Janjeet Sentry");
    expect(energy(game)).toBe(2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickModes(a, 1);
    activate(game, sentry, 0, { targets: [ref(bears)] });
    expect(tapped(game, bears)).toBe(false);
    expect(tapped(game, sentry)).toBe(true);
    expect(energy(game)).toBe(0);
  });

  it("Aether Meltdown can enchant an uncrewed Vehicle, and gives energy", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const cruiser = spawn(game, "Fleetwheel Cruiser", B);
    const meltdown = toHand(game, "Aether Meltdown");
    cast(game, meltdown, { targets: [ref(cruiser)] });
    expect(game.state.objects[meltdown].attachedTo).toBe(cruiser);
    expect(energy(game)).toBe(2);
  });

  it("Hazardous Conditions spares a creature with any counter on it", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const bare = spawn(game, "Grizzly Bears", B);
    const marked = spawn(game, "Grizzly Bears", B);
    game.state.objects[marked].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Hazardous Conditions"));
    expect(zone(game, bare)).toBe("graveyard");
    expect(zone(game, marked)).toBe("battlefield");
    expect(counters(game, marked)).toBe(1);
    expect(pt(game, marked)).toEqual({ power: 3, toughness: 3 });
  });

  it("Engineered Might's second mode pumps your creatures and gives vigilance", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Engineered Might"), { modes: [1] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Incendiary Sabotage sacrifices an artifact to deal 3 to each creature", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Incendiary Sabotage"), { sacrifice: thopter });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Eddytrail Hawk pays {E} to give another attacker flying", () => {
    const { game, a } = table();
    const hawk = enter(game, "Eddytrail Hawk");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = () => [ref(bears)];
    pickModes(a, 0);
    attack(game, a, [hawk, bears]);
    expect(energy(game)).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});
