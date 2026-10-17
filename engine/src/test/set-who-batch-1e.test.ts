/**
 * Doctor Who (WHO), batch 1, part e (2026-10-17): Doctors, vehicles, an
 * adventurer and suspend creatures. Written on the shared table in
 * `harness.ts`, each test from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("The Third Doctor", () => {
  it("creates the chosen token and gets +1/+1 for each noncreature token you control", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const doctor = enter(game, "The Third Doctor");
    expect(named(game, "Clue Token")).toBe(1);
    expect(named(game, "Food Token") + named(game, "Treasure Token")).toBe(0);
    expect(pt(game, doctor)).toEqual({ power: 3, toughness: 3 });
    const make = (player: typeof A, token: string): void =>
      game.debugApplyEffect(player, { kind: "create-token", token, count: 1 }, []);
    make(A, "Treasure Token");
    expect(pt(game, doctor)).toEqual({ power: 4, toughness: 4 });
    // A creature token, a nontoken artifact and an opponent's token don't count.
    make(A, "Soldier Token");
    spawn(game, "Sol Ring");
    make(B, "Food Token");
    expect(pt(game, doctor)).toEqual({ power: 4, toughness: 4 });
  });
});

function named(game: ReturnType<typeof table>["game"], name: string): number {
  return game.battlefield.filter((id) => game.state.objects[id].cardName === name).length;
}

describe("The Fifth Doctor", () => {
  it("counters and untaps only the creatures that didn't attack or enter this turn", () => {
    const { game, a } = table();
    const doctor = spawn(game, "The Fifth Doctor");
    const attacker = spawn(game, "Grizzly Bears");
    const homebody = spawn(game, "Grizzly Bears", A, { tapped: true });
    // On a later turn of alice's, so none of these entered this turn.
    toStep(game, "precombat-main");
    game.state.objects[homebody].tapped = true;
    attack(game, a, [attacker]);
    const newcomer = enter(game, "Grizzly Bears");
    game.state.objects[newcomer].tapped = true;
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(counters(game, doctor)).toBe(1);
    expect(counters(game, homebody)).toBe(1);
    expect(game.state.objects[homebody].tapped).toBe(false);
    expect(counters(game, attacker)).toBe(0);
    expect(game.state.objects[attacker].tapped).toBe(true);
    expect(counters(game, newcomer)).toBe(0);
    expect(game.state.objects[newcomer].tapped).toBe(true);
    expect(counters(game, theirs)).toBe(0);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Banish to Another Universe", () => {
  it("costs {1} less for each historic permanent, counting a legendary artifact once", () => {
    const { game, a } = table();
    spawn(game, "Ornithopter");
    spawn(game, "Bessie, the Doctor's Roadster");
    const plains = lands(game, "Plains", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    cast(game, toHand(game, "Banish to Another Universe"));
    expect(plains.every((p) => game.state.objects[p].tapped)).toBe(true);
    expect(zone(game, bear)).toBe("exile");
    const banish = game.battlefield.find((id) => game.state.objects[id].cardName === "Banish to Another Universe")!;
    destroy(game, banish);
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Atraxi Warden", () => {
  it("can exile only a tapped creature as it enters", () => {
    const { game, a } = table();
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const seen = watchTargets(a, () => [tapped]);
    enter(game, "Atraxi Warden");
    expect(seen.offered[0]).toContain(tapped);
    expect(seen.offered[0]).not.toContain(untapped);
    expect(zone(game, tapped)).toBe("exile");
    expect(zone(game, untapped)).toBe("battlefield");
  });
});

describe("Renegade Silent", () => {
  it("goads a creature you don't control, grows, and phases out until your next turn", () => {
    const { game, a } = table();
    const silent = spawn(game, "Renegade Silent");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[bear].goadedBy).toContain(A);
    expect(counters(game, silent)).toBe(1);
    expect(zone(game, silent)).toBe("phased-out");
    toStep(game, "upkeep");
    expect(zone(game, silent)).toBe("battlefield");
    expect(counters(game, silent)).toBe(1);
  });

  it("still grows and phases out with no creature goaded", () => {
    const { game, a } = table();
    const silent = spawn(game, "Renegade Silent");
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    toStep(game, "end");
    settle(game);
    expect(counters(game, silent)).toBe(1);
    expect(zone(game, silent)).toBe("phased-out");
  });
});

describe("Sontaran General", () => {
  it("with two others attacking, goads one creature of each opponent, and they can't block", () => {
    const { game, a } = table({ players: 3 });
    const general = spawn(game, "Sontaran General");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    // Three players: a slot each for bob and carol, none for an empty seat.
    const seen = watchTargets(a, () => [bobs, carols]);
    attack(game, a, [general, ...bears]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual([bobs]);
    expect(seen.offered[1]).toEqual([carols]);
    expect(game.state.objects[bobs].goadedBy).toContain(A);
    expect(game.state.objects[carols].goadedBy).toContain(A);
    expect(game.characteristics(bobs).restrictions).toContain("cant-block");
    expect(game.characteristics(carols).restrictions).toContain("cant-block");
  });

  it("doesn't trigger attacking with only one other creature", () => {
    const { game, a } = table();
    const general = spawn(game, "Sontaran General");
    const bear = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bobs]);
    attack(game, a, [general, bear]);
    expect(seen.asked).toBe(0);
    expect(game.state.objects[bobs].goadedBy).toBeUndefined();
  });
});

describe("The Moment", () => {
  it("gets a time counter each upkeep", () => {
    const { game } = table();
    const moment = spawn(game, "The Moment");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, moment, "time")).toBe(1);
  });

  it("destroys each nonland permanent with mana value up to its time counters, itself included, then can't be sacrificed", () => {
    const { game } = table();
    const moment = spawn(game, "The Moment");
    game.state.objects[moment].counters.time = 2;
    const bear = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring");
    const angel = spawn(game, "Serra Angel", B);
    const wastes = lands(game, "Wastes", 3);
    activate(game, moment, 1);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, moment)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(wastes.every((w) => zone(game, w) === "battlefield")).toBe(true);
  });

  it("sacrifices itself after the wipe when it survives it", () => {
    const { game } = table();
    const moment = spawn(game, "The Moment");
    game.state.objects[moment].counters.time = 1;
    const ring = spawn(game, "Sol Ring");
    lands(game, "Wastes", 3);
    activate(game, moment, 1);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, moment)).toBe("graveyard");
  });

  it("untaps a creature you control and phases it out until The Moment leaves", () => {
    const { game } = table();
    const moment = spawn(game, "The Moment");
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Wastes", 2);
    activate(game, moment, 0, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("phased-out");
    expect(game.state.objects[bear].tapped).toBe(false);
    // Not at its controller's next untap step…
    toStep(game, "upkeep");
    expect(zone(game, bear)).toBe("phased-out");
    // …but as The Moment leaves.
    destroy(game, moment);
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("The Flood of Mars", () => {
  it("floods another creature, which becomes a copy of it", () => {
    const { game, a } = table();
    const flood = spawn(game, "The Flood of Mars");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    attack(game, a, [flood]);
    expect(counters(game, bear, "flood")).toBe(1);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, bear)).toEqual(["Alien", "Zombie", "Horror"]);
    expect(keywords(game, bear).has("islandwalk")).toBe(true);
    expect(game.state.objects[bear].controller).toBe(B);
  });

  it("floods a land, which becomes an Island in addition to its other types for good", () => {
    const { game, a } = table();
    const flood = spawn(game, "The Flood of Mars");
    const forest = spawn(game, "Forest", B);
    pickTargets(a, forest);
    attack(game, a, [flood]);
    expect(counters(game, forest, "flood")).toBe(1);
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Island"]));
    game.state.objects[forest].counters.flood = 0;
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Island"]));
  });
});

describe("Twice Upon a Time // Unlikely Meeting", () => {
  it("finds a Doctor on an adventure, then takes an extra turn from exile only with two Doctors", () => {
    const { game, a } = table();
    const card = toHand(game, "Twice Upon a Time");
    const doctor = toLibrary(game, "The Fifth Doctor");
    lands(game, "Island", 3);
    pickFromZone(a, doctor);
    // Without two Doctors, the sorcery half can't be cast from the hand.
    expect(
      game.legalActions(A).some((x) => x.kind === "cast-spell" && "card" in x && x.card === card && (x.face ?? 0) === 0),
    ).toBe(false);
    cast(game, card, { face: 1 });
    expect(hand(game)).toContain(doctor);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].onAdventure).toBe(true);
    lands(game, "Island", 6);
    expect(() => cast(game, card, { via: "adventure", face: 0 })).toThrow(/refused/);
    spawn(game, "The Third Doctor");
    spawn(game, "The Fifth Doctor");
    cast(game, card, { via: "adventure", face: 0 });
    expect(game.state.extraTurns).toEqual([A]);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].onAdventure).toBeFalsy();
    expect(graveyard(game)).not.toContain(card);
  });
});
