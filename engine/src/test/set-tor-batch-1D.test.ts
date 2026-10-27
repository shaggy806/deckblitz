/**
 * Torment (TOR; B220), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  enter,
  registryOf,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const colors = (game: Parameters<typeof toGraveyard>[0], id: ObjectId): readonly string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).colors];

const fill =(game: Parameters<typeof toGraveyard>[0], n: number, name = "Wastes"): void => {
  for (let i = 0; i < n; i++) toGraveyard(game, name);
};

describe("Torment group D", () => {
  it("Parallel Evolution: each creature token's controller gets a copy of it", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Parallel Evolution"));
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(2);
  });

  it("Mortal Combat: wins at upkeep with twenty creature cards in the graveyard, not nineteen", () => {
    const { game } = table();
    spawn(game, "Mortal Combat");
    fill(game, 19, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.result.winner ?? null).toBe(null);
    toGraveyard(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.result.winner).toBe(A);
  });

  it("Grim Lavamancer: exiles two graveyard cards to deal 2", () => {
    const { game } = table();
    const lava = spawn(game, "Grim Lavamancer");
    lands(game, "Mountain", 1);
    fill(game, 3);
    activate(game, lava, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(graveyard(game, A).length).toBe(1);
  });

  it("Invigorating Falls: counts creature cards in every graveyard", () => {
    const { game } = table();
    fill(game, 2, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Wastes", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Invigorating Falls"));
    expect(life(game, A)).toBe(23);
  });

  it("Cephalid Sage: draws three and discards two only with threshold as it enters", () => {
    const { game } = table();
    const before = hand(game, A).length;
    enter(game, "Cephalid Sage");
    expect(hand(game, A).length).toBe(before);
    fill(game, 7);
    enter(game, "Cephalid Sage");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Centaur Chieftain: with threshold, creatures you control get +1/+1 and trample", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    fill(game, 7);
    const chief = enter(game, "Centaur Chieftain");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, chief)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bear).has("trample")).toBe(true);
  });

  it("Temporary Insanity: only a creature with power less than your graveyard size, and takes it", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Mountain", 4);
    fill(game, 2);
    const spell = toHand(game, "Temporary Insanity");
    expect(() => cast(game, spell, { targets: [ref(bear)] })).toThrow();
    toGraveyard(game, "Wastes");
    cast(game, spell, { targets: [ref(bear)] });
    expect(controller(game, bear)).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(keywords(game, bear).has("haste")).toBe(true);
  });

  it("Cephalid Aristocrat: mills two when it becomes a target", () => {
    const { game } = table();
    const crat = spawn(game, "Cephalid Aristocrat");
    const lava = spawn(game, "Grim Lavamancer");
    lands(game, "Mountain", 1);
    fill(game, 2);
    activate(game, lava, 0, { targets: [ref(crat)] });
    // Two exiled for the cost, two milled by the trigger.
    expect(graveyard(game, A).length).toBe(2);
  });

  it("Churning Eddy: returns a creature and a land", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Churning Eddy"), { targets: [ref(bear), ref(land)] });
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, land)).toBe("hand");
  });

  it("Petradon: exiles two lands and returns them when it leaves", () => {
    const { game, a } = table();
    const l1 = spawn(game, "Forest", B);
    const l2 = spawn(game, "Plains", B);
    pickTargets(a, l1, l2);
    const pet = enter(game, "Petradon");
    expect(zone(game, l1)).toBe("exile");
    expect(zone(game, l2)).toBe("exile");
    destroy(game, pet);
    expect(zone(game, pet)).toBe("graveyard");
    const back = game.state.zones.shared.battlefield.filter(
      (id) => ["Forest", "Plains"].includes(game.state.objects[id].cardName),
    );
    expect(back.length).toBe(2);
    expect(back.every((id) => controller(game, id) === B)).toBe(true);
  });

  it("Possessed Barbarian: with threshold it's a black 4/4 that can destroy a red creature", () => {
    const { game } = table();
    const barb = spawn(game, "Possessed Barbarian");
    const red = spawn(game, "Grim Lavamancer", B);
    expect(() => activate(game, barb, 0, { targets: [ref(red)] })).toThrow();
    fill(game, 7);
    expect(pt(game, barb)).toEqual({ power: 4, toughness: 4 });
    expect(colors(game, barb)).toEqual(["B"]);
    lands(game, "Swamp", 3);
    activate(game, barb, 0, { targets: [ref(red)] });
    expect(zone(game, red)).toBe("graveyard");
  });

  it("Anurid Scavenger: puts a graveyard card on the bottom, or is sacrificed", () => {
    const { game, a } = table();
    const scav = spawn(game, "Anurid Scavenger");
    const card = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, card);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, scav)).toBe("battlefield");
    expect(zone(game, card)).toBe("library");
    const lib = game.state.zones.perPlayer[A].library;
    expect(lib[lib.length - 1]).toBe(card);
    // An empty graveyard: nothing to put, so it's sacrificed.
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, scav)).toBe("graveyard");
  });

  it("Mortiphobia: discards a card to exile a graveyard card", () => {
    const { game } = table();
    const mp = spawn(game, "Mortiphobia");
    lands(game, "Swamp", 2);
    const target = toGraveyard(game, "Grizzly Bears", B);
    const before = hand(game, A).length;
    activate(game, mp, 0, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("exile");
    expect(hand(game, A).length).toBe(before - 1);
    expect(zone(game, mp)).toBe("battlefield");
  });
});
