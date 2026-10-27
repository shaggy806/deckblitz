import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

// Planeshift, batch 1, group B.

const colorsOf = (game: Game, id: ObjectId): readonly string[] => [
  ...computeCharacteristics(game.state, registryOf(game), id).colors,
];

describe("Planeshift — group B", () => {
  it("Nemata: sacrificing a Saproling pumps every Saproling, an opponent's too", () => {
    const { game } = table();
    const nemata = spawn(game, "Nemata, Grove Guardian");
    const fodder = spawn(game, "Saproling Token");
    const mine = spawn(game, "Saproling Token");
    const theirs = spawn(game, "Saproling Token", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: nemata,
      abilityIndex: 1,
      targets: [],
      sacrifice: fodder,
    } as Action);
    settle(game);
    expect(game.state.objects[fodder]?.zone ?? "gone").not.toBe("battlefield");
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, nemata)).toEqual({ power: 4, toughness: 5 });
  });

  it("Silver Drake returns a white or blue creature you control — not a green one", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const knight = spawn(game, "Savannah Lions");
    const seen = pickPermanents(a, knight);
    const drake = enter(game, "Silver Drake");
    expect(seen.offered).toContain(drake);
    expect(seen.offered).toContain(knight);
    expect(seen.offered).not.toContain(bear);
    expect(zone(game, knight)).toBe("hand");
    expect(zone(game, drake)).toBe("battlefield");
  });

  it("Sparkcaster returns a red or green creature and deals 1 to target player", () => {
    const { game, a } = table();
    const lions = spawn(game, "Savannah Lions");
    const bear = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, bear);
    pickTargets(a, B);
    const kavu = enter(game, "Sparkcaster");
    expect(seen.offered).not.toContain(lions);
    expect(seen.offered).toContain(kavu);
    expect(zone(game, bear)).toBe("hand");
    expect(life(game, B)).toBe(19);
  });

  it("Stormscape Battlemage kicked with both: 3 life and a nonblack creature destroyed", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    cast(game, toHand(game, "Stormscape Battlemage"), { kicked: true, kickCount: 3 });
    expect(life(game, A)).toBe(23);
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("Stormscape Battlemage kicked with {W} only: life, no destroy", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Plains", 1);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Stormscape Battlemage"), { kicked: true, kickCount: 1 });
    expect(life(game, A)).toBe(23);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Sisay's Ingenuity draws, and the enchanted creature can make a creature the chosen colour", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Savannah Lions", B);
    const aura = toHand(game, "Sisay's Ingenuity");
    const before = hand(game).length;
    cast(game, aura, { targets: [ref(mine)] });
    expect(hand(game).length).toBe(before); // the Aura left, a card came in
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === mine);
    expect(offer).toBeDefined();
    pickModes(a, 2); // Black
    activate(game, mine, offer!.kind === "activate-ability" ? offer!.abilityIndex : 0, { targets: [ref(theirs)] });
    expect(colorsOf(game, theirs)).toEqual(["B"]);
  });

  it("Singe deals 1 and the creature becomes black", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Singe"), { targets: [ref(bear)] });
    expect(game.state.objects[bear].damageMarked).toBe(1);
    expect(colorsOf(game, bear)).toEqual(["B"]);
  });

  it("Alpha Kavu may target only a Kavu creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const alpha = spawn(game, "Alpha Kavu");
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Sparkcaster", B);
    const activation = (target: ObjectId): Action =>
      ({ type: "activate-ability", player: A, source: alpha, abilityIndex: 0, targets: [ref(target)] }) as Action;
    expect(game.canDispatch(activation(bear))).not.toBeNull();
    expect(game.canDispatch(activation(alpha))).toBeNull();
    activate(game, alpha, 0, { targets: [ref(other)] });
    expect(pt(game, other)).toEqual({ power: 4, toughness: 4 });
  });

  it("Quirion Dryad grows on a red spell, not on a green one", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const dryad = spawn(game, "Quirion Dryad");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, dryad)).toBe(1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(dryad)] });
    expect(counters(game, dryad)).toBe(1);
  });
});
